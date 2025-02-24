import os

from dotenv import load_dotenv


load_dotenv()
basedir = os.path.abspath(os.path.dirname(__file__))
default_db_uri = f"sqlite:///{os.path.join(basedir, 'instance', 'site.db')}"


def as_bool(value: str) -> bool:
    if value:
        return value.lower() in ["true", "yes", "on", "1", "t", "y"]
    return False


class Config:
    # Flask options
    DEBUG = False
    TESTING = False

    # Handlers options
    CREATE_FILE_LOGGER = True
    CREATE_MAIL_HANDLER = True

    # Database options
    SQLITE_JOURNAL_MODE = "WAL"
    SQLITE_SYNCHRONOUS = "NORMAL"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"connect_args": {"timeout": 20}}
    SQLALCHEMY_DATABASE_URI = (os.environ.get("SCIENCEFEED_DATABASE_URI") or default_db_uri)

    # Security options
    MAX_CONTENT_LENGTH = 8 * 1024 * 1024
    SECRET_KEY = os.environ.get("SECRET_KEY", "top-secret!")
    REFRESH_TOKEN_DAYS = int(os.environ.get("REFRESH_TOKEN_DAYS") or "7")
    RESET_TOKEN_MINUTES = int(os.environ.get("RESET_TOKEN_MINUTES") or "15")
    ACCESS_TOKEN_MINUTES = int(os.environ.get("ACCESS_TOKEN_MINUTES") or "15")

    # Email options
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")
    MAIL_PORT = int(os.environ.get("MAIL_PORT") or "25")
    MAIL_SERVER = os.environ.get("MAIL_SERVER", "localhost")
    MAIL_USE_TLS = as_bool(os.environ.get("MAIL_USE_TLS") or "True")
    MAIL_USE_SSL = as_bool(os.environ.get("MAIL_USE_SSL") or "False")
    SEND_EMAIL_TO_ACTIVATE_USER = os.environ.get("SEND_EMAIL_TO_ACTIVATE_USER", "False")

    # RSS Fetcher Options
    FETCH_ON_START = True
    DELTA_MINUTES = int(os.environ.get("DELTA_MINUTES") or "20")


class DevConfig(Config):
    # Flask options
    DEBUG = True
    TESTING = False

    # Handlers options
    CREATE_FILE_LOGGER = False
    CREATE_MAIL_HANDLER = False

    # Database options
    SQLITE_JOURNAL_MODE = "DELETE"
    SQLITE_SYNCHRONOUS = "FULL"

    # Email options
    SEND_EMAIL_TO_ACTIVATE_USER = False

    # Security options
    ACCESS_TOKEN_MINUTES = int("15")

    # RSS Fetcher Options
    FETCH_ON_START = False
    DELTA_MINUTES = int("0")


class TestConfig(Config):
    # Flask options
    DEBUG = False
    TESTING = True
    SERVER_NAME = "localhost:5000"

    # Handlers options
    CREATE_FILE_LOGGER = False
    CREATE_MAIL_HANDLER = False

    # Email options
    SEND_EMAIL_TO_ACTIVATE_USER = False

    # RSS Fetcher Options
    FETCH_ON_START = False

    # Database options
    SQLALCHEMY_DATABASE_URI = "sqlite://"


def get_config():
    """ Get the config class based on the FLASK_ENV environment variable or default to Config (production) """

    env = os.getenv("FLASK_ENV", "production").lower()
    if env == "development":
        return DevConfig
    elif env == "testing":
        return TestConfig

    return Config
