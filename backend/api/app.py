import logging
import os
from logging.handlers import SMTPHandler, RotatingFileHandler
from typing import Type

from flask import Flask
from flask_cors import CORS
from flask_mail import Mail
from flask_marshmallow import Marshmallow
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

from backend.config import Config, get_config


# Load globally accessible plugins
mail = Mail()
db = SQLAlchemy()
migrate = Migrate()
cors = CORS()
ma = Marshmallow()


def import_blueprints(app: Flask):
    from backend.api.routes import main as main_bp
    from backend.api.tokens import tokens as tokens_bp
    from backend.api.errors import errors as errors_bp

    api_blueprints = [tokens_bp, errors_bp, main_bp]

    for blueprint in api_blueprints:
        app.register_blueprint(blueprint, url_prefix="/api")


def create_app_logger(app: Flask):
    log_file_path = os.path.join(os.path.dirname(app.root_path), "logs", "ScienceFeed.log")
    os.makedirs(os.path.dirname(log_file_path), exist_ok=True)

    handler = RotatingFileHandler(log_file_path, maxBytes=3000000, backupCount=15)
    handler.setFormatter(logging.Formatter("[%(asctime)s] %(levelname)s - %(message)s"))
    handler.setLevel(logging.INFO)

    app.logger.addHandler(handler)
    app.logger.info("ScienceFeed is starting up...")


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


def create_app(config_class: Type[Config] = None) -> Flask:
    app = Flask(__name__, static_url_path="/api/static")

    if config_class is None:
        config_class = get_config()

    app.config.from_object(config_class)
    app.url_map.strict_slashes = False

    mail.init_app(app)
    db.init_app(app)
    ma.init_app(app)
    migrate.init_app(app, db, compare_type=False, render_as_batch=True)
    cors.init_app(app, supports_credentials=True, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

    with app.app_context():
        from backend.cli.commands import create_cli_commands
        from backend.api.models import RssFeed
        from backend.cli.tasks import seed_database

        import_blueprints(app)
        create_cli_commands()

        db.create_all()

        if RssFeed.query.count() == 0:
            seed_database()

        if not app.debug and not app.testing:
            create_app_logger(app)
            create_mail_handler(app)

        return app
