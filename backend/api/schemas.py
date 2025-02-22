from marshmallow import validate, ValidationError, validates
from webargs.flaskparser import FlaskParser as BaseFlaskParser

from backend.api.app import ma
from backend.api.models import User
from backend.api.handlers import current_user


class ApiValidationError(Exception):
    def __init__(self, status_code, messages):
        self.status_code = status_code
        self.messages = messages


class FlaskParser(BaseFlaskParser):
    USE_ARGS_POSITIONAL = False
    DEFAULT_VALIDATION_STATUS = 400

    def load_form(self, req, schema):
        return {**self.load_files(req, schema), **super().load_form(req, schema)}

    def handle_error(self, error, req, schema, *, error_status_code, error_headers):
        raise ApiValidationError(error_status_code or self.DEFAULT_VALIDATION_STATUS, error.messages)


class TokenSchema(ma.Schema):
    access_token = ma.String(required=True)


class PasswordResetRequestSchema(ma.Schema):
    email = ma.String(required=True, validate=[validate.Length(max=120), validate.Email()])
    callback = ma.String(required=True)


class PasswordResetSchema(ma.Schema):
    token = ma.String(required=True)
    new_password = ma.String(required=True, validate=validate.Length(min=8))


class PasswordSchema(ma.Schema):
    current_password = ma.String(required=True)
    new_password = ma.String(required=True, validate=validate.Length(min=8))

    @validates("current_password")
    def validate_current_password(self, value):
        if not current_user.verify_password(value):
            raise ValidationError("Password is incorrect")


class RegisterUserSchema(ma.Schema):
    username = ma.String(required=True, validate=validate.Length(min=3, max=14))
    email = ma.String(required=True, validate=validate.Email())
    password = ma.String(required=True, validate=validate.Length(min=8))
    callback = ma.String(required=True)

    @validates("username")
    def validate_username(self, value):
        if User.query.filter_by(username=value).first():
            raise ValidationError("Invalid Username")

    @validates("email")
    def validate_email(self, value):
        if User.query.filter_by(email=value).first():
            raise ValidationError("Invalid Email")
