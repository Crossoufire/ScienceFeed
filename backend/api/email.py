from threading import Thread
from typing import List, Dict

from flask_mail import Message
from flask import current_app, Flask, render_template

from backend.api.app import mail


def _send_async_email(app: Flask, to: str, username: str, subject: str, template: str, callback: str, token: str):
    with app.app_context():
        email_html = render_template(
            template + ".html",
            username=username,
            link=f"{callback}/?token={token}",
        )
        msg = Message(
            subject=f"ScienceFeed - {subject}",
            sender=current_app.config["MAIL_USERNAME"],
            recipients=[to],
            html=email_html,
            bcc=[current_app.config["MAIL_USERNAME"]],
            reply_to=current_app.config["MAIL_USERNAME"],
        )
        mail.send(msg)


def send_email(to: str, username: str, subject: str, template: str, callback: str, token: str):
    # noinspection PyProtectedMember,PyUnresolvedReferences
    app = current_app._get_current_object()
    thread = Thread(target=_send_async_email, args=(app, to, username, subject, template, callback, token))
    thread.start()
    return thread


def _send_async_feed_email(app: Flask, to: str, username: str, subject: str, template: str, articles: List[Dict]):
    with app.app_context():
        email_html = render_template(
            template + ".html",
            username=username,
            articles=articles,
            dashboard_url=f"https://localhost:3000/dashboard" if app.debug else "https://science-feed.mylists.info/dashboard",
        )
        msg = Message(
            subject=f"ScienceFeed - {subject}",
            sender=current_app.config["MAIL_USERNAME"],
            recipients=[to],
            html=email_html,
            bcc=[current_app.config["MAIL_USERNAME"]],
            reply_to=current_app.config["MAIL_USERNAME"],
        )
        mail.send(msg)


def send_feed_email(to: str, username: str, subject: str, template: str, articles: List[Dict]):
    # noinspection PyProtectedMember,PyUnresolvedReferences
    app = current_app._get_current_object()
    thread = Thread(target=_send_async_feed_email, args=(app, to, username, subject, template, articles))
    thread.start()
    return thread
