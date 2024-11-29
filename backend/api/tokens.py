from __future__ import annotations

from typing import Tuple, Dict

from werkzeug.http import dump_cookie
from flask import Blueprint, request, abort, url_for, current_app

from backend.api.app import db
from backend.api.schemas import *
from backend.api.models import Token
from backend.api.decorators import body
from backend.api.email import send_email
from backend.api.handlers import basic_auth, token_auth
from backend.api.utils import naive_utcnow


tokens = Blueprint("api_tokens", __name__)


def token_response(token: Token) -> Tuple[Dict, int, Dict]:
    headers = {
        "Set-Cookie": dump_cookie(
            key="refresh_token",
            value=token.refresh_token,
            path=url_for("api_tokens.new_token"),
            secure=True,
            httponly=True,
            samesite="none",
            max_age=current_app.config["REFRESH_TOKEN_DAYS"] * 24 * 60 * 60,
        ),
    }
    return {"access_token": token.access_token}, 200, headers


@tokens.route("/register_user", methods=["POST"])
@body(RegisterUserSchema)
def register_user(data):
    """ Create a new user account """

    new_user = User(
        username=data["username"],
        email=data["email"],
        password=data["password"],
        registered_on=naive_utcnow(),
        active=False,
    )
    db.session.add(new_user)
    db.session.commit()

    try:
        send_email(
            to=new_user.email,
            username=new_user.username,
            subject="Register account",
            template="register",
            callback=data["callback"],
            token=new_user.generate_jwt_token(),
        )
    except Exception as e:
        current_app.logger.error(f"ERROR sending an email to account [{new_user.id}]: {e}")
        return abort(400, description="An error occurred while sending your register email. Please try again later")

    return {}, 204


@tokens.route("/tokens", methods=["POST"])
@basic_auth.login_required
def new_token():
    """ Create an `access token` and a `refresh token`. The `refresh token` is returned as a cookie """

    if not current_user.active:
        return abort(403, description="Your account is not activated, please check your emails")

    token = current_user.generate_auth_token()
    db.session.add(token)
    Token.clean()
    db.session.commit()
    
    response = token_response(token)
    response[0]["data"] = current_user.to_dict()

    return response


@tokens.route("/tokens", methods=["PUT"])
@body(TokenSchema)
def refresh(data):
    """
    Refresh an `access token`.
    The client needs to pass the `refresh token` in a cookie.
    The `access token` must be passed in the request body.
    """

    access_token = data["access_token"]
    refresh_token = request.cookies.get("refresh_token")
    if not access_token or not refresh_token:
        return abort(401, description="Invalid token")

    token = User.verify_refresh_token(refresh_token, access_token)
    if not token:
        return abort(401, description="Invalid token")

    token.expire()
    new_token_ = token.user.generate_auth_token()
    db.session.add_all([token, new_token_])
    db.session.commit()

    return token_response(new_token_)


@tokens.route("/tokens", methods=["DELETE"])
@token_auth.login_required
def revoke_token():
    """ Revoke an access token = logout """

    access_token = request.headers["Authorization"].split()[1]

    token = Token.query.filter_by(access_token=access_token).first()
    if not token:
        return abort(401, description="Invalid token")

    token.expire()
    db.session.commit()

    return {}, 204


@tokens.route("/tokens/reset_password_token", methods=["POST"])
@body(PasswordResetRequestSchema)
def reset_password_token(data):
    user = User.query.filter_by(email=data["email"]).first()
    if not user:
        return abort(400, description="This email is invalid")
    if not user.active:
        return abort(400, description="This account is not activated. Please check your emails.")

    try:
        send_email(
            to=user.email,
            username=user.username,
            subject="Password Reset Request",
            template="password_reset",
            callback=data["callback"],
            token=user.generate_jwt_token(),
        )
    except Exception as e:
        current_app.logger.error(f"ERROR sending an email to account [{user.id}]: {e}")
        return abort(400, description="An error occurred while sending the password reset email.")

    return {}, 204


@tokens.route("/tokens/reset_password", methods=["POST"])
@body(PasswordResetSchema)
def reset_password(data):
    """ Reset the user's password """

    user = User.verify_jwt_token(data["token"])
    if not user:
        return abort(400, description="Invalid or expired token")
    if not user.active:
        return abort(400, description="This account is not activated. Please check your emails.")

    user.password = data["new_password"]
    db.session.commit()
    current_app.logger.info(f"[INFO] - [{user.id}] Password changed.")

    return {}, 204


@tokens.route("/tokens/register_token", methods=["POST"])
def register_token():
    """ Check the register token to validate a new user account """

    try:
        token = request.get_json()["token"]
    except:
        return abort(400, description="The provided token is invalid or expired")

    user = User.verify_jwt_token(token)
    if not user or user.active:
        return abort(400, description="The provided token is invalid or expired")

    user.active = True
    user.activated_on = naive_utcnow()

    db.session.commit()
    current_app.logger.info(f"[INFO] - [{user.id}] Account activated.")

    return {}, 204
