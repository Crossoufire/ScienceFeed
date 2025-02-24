import os
import sys
import logging
from typing import Type
from logging.handlers import SMTPHandler, RotatingFileHandler

from flask import Flask
from flask_cors import CORS
from flask_mail import Mail
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow

from backend.config import Config, get_config, default_db_uri, basedir


# Load globally accessible plugins
mail = Mail()
cors = CORS()
db = SQLAlchemy()
ma = Marshmallow()
migrate = Migrate()


def import_blueprints(app: Flask):
    from backend.api.routes import main as main_bp
    from backend.api.tokens import tokens as tokens_bp
    from backend.api.errors import errors as errors_bp

    api_blueprints = [tokens_bp, errors_bp, main_bp]

    for blueprint in api_blueprints:
        app.register_blueprint(blueprint, url_prefix="/api")


def create_file_handler(app: Flask):
    """ Create a RotatingFileHandler """

    import socket
    import platform

    log_file_path = os.path.join(os.path.dirname(app.root_path), "logs", "science-feed.log")
    os.makedirs(os.path.dirname(log_file_path), exist_ok=True)

    handler = RotatingFileHandler(log_file_path, maxBytes=3000000, backupCount=15)
    handler.setFormatter(logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))
    handler.setLevel(logging.INFO)

    env = os.getenv("FLASK_ENV", "production").lower() or "production"

    app.logger.addHandler(handler)
    app.logger.setLevel(logging.INFO)

    app.logger.info(
        f"ScienceFeed is starting up... "
        f"[ENV: {env}, DEBUG: {app.debug}, Python: {platform.python_version()}, Host: {socket.gethostname()}]"
    )


def create_mail_handler(app: Flask):
    """ Create a TLS only mail handler associated with the app logger: send email when errors occurs """

    mail_handler = SMTPHandler(
        mailhost=(app.config["MAIL_SERVER"], app.config["MAIL_PORT"]),
        fromaddr=app.config["MAIL_USERNAME"],
        toaddrs=app.config["MAIL_USERNAME"],
        subject="ScienceFeed - Exceptions occurred",
        credentials=(app.config["MAIL_USERNAME"], app.config["MAIL_PASSWORD"]),
        secure=(),
    )

    mail_handler.setLevel(logging.ERROR)
    app.logger.addHandler(mail_handler)


def setup_app_and_db(app: Flask):
    """
    On app starts:
    - Create `instance` folder if default db location used
    - Set up the pragmas for SQLite
    - Create all the tables
    - Seed the database with RSS Feeds if empty
    """

    from sqlalchemy import text
    from backend.api.models import RssFeed
    from backend.cli.tasks import seed_database

    # Ensure `instance` folder exists if default db location used
    if app.config["SQLALCHEMY_DATABASE_URI"] == default_db_uri:
        instance_folder = os.path.join(basedir, "instance")
        os.makedirs(instance_folder, exist_ok=True)

    # Configure SQLite database PRAGMA
    engine = db.session.get_bind()
    with engine.connect() as conn:
        pragmas_values = [app.config["SQLITE_JOURNAL_MODE"], app.config["SQLITE_SYNCHRONOUS"]]
        pragmas_to_check = ["journal_mode", "synchronous"]
        for pn, pv in zip(pragmas_to_check, pragmas_values):
            conn.execute(text(f"PRAGMA {pn}={pv}"))
            value = conn.execute(text(f"PRAGMA {pn}")).scalar()
            if app.config["CREATE_FILE_LOGGER"]:
                app.logger.info(f"SQLITE PRAGMA {pn.upper()}: {value.upper() if isinstance(value, str) else value}")

    # Create all tables
    db.create_all()

    # Seed database with RSS Feeds if empty
    if RssFeed.query.count() == 0:
        seed_database()

    # Fetch and filter articles for all users
    if app.config["FETCH_ON_START"]:
        from backend.cli.tasks import fetch_and_filter_articles
        fetch_and_filter_articles()


def create_app(config_class: Type[Config] = None) -> Flask:
    app = Flask(__name__, static_url_path="/api/static")

    app.url_map.strict_slashes = False
    app.config.from_object(config_class or get_config())

    db.init_app(app)
    ma.init_app(app)
    mail.init_app(app)
    migrate.init_app(app, db, compare_type=False, render_as_batch=True)
    cors.init_app(app, supports_credentials=True, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

    with app.app_context():
        # No logs in terminal when using CLI
        if app.config["CREATE_FILE_LOGGER"] and not sys.stdin.isatty():
            create_file_handler(app)

        if app.config["CREATE_MAIL_HANDLER"]:
            create_mail_handler(app)

        from backend.cli.commands import register_cli_commands
        register_cli_commands()
        setup_app_and_db(app)
        import_blueprints(app)

        return app
