from datetime import datetime, timedelta

from flask import Blueprint, jsonify, request, abort, current_app

from backend.api.app import db
from backend.api.handlers import current_user, token_auth
from backend.api.models import Keyword, RssFeed, UserRssFeed, UserArticle, User


main = Blueprint("main_api", __name__)


@main.route("/current_user", methods=["GET"])
@token_auth.login_required
def get_current_user():
    return current_user.to_dict(), 200


@main.route("/keywords", methods=["GET"])
@token_auth.login_required
def get_keywords():
    """ Get all user defined keywords """
    return jsonify(data=[keyword.to_dict() for keyword in Keyword.get_all_keywords(current_user)]), 200


@main.route("/rss_feeds", methods=["GET"])
@token_auth.login_required
def get_rss_feeds():
    """ Get all user defined and global RSS feeds """
    all_rss_feeds = [rss_feed.to_dict() for rss_feed in RssFeed.get_all_rss_feeds()]
    all_user_rss_feeds = [user_rss_feed.to_dict() for user_rss_feed in UserRssFeed.get_all_rss_feeds(current_user)]
    return jsonify(data={"rss_feeds": all_rss_feeds, "user_rss_feeds": all_user_rss_feeds}), 200


@main.route("/dashboard", methods=["GET"])
@token_auth.login_required
def dashboard():
    """ Dashboard page """
    articles = [article.to_dict() for article in UserArticle.get_articles_with_active_keywords(current_user)]
    return jsonify(data=articles), 200


@main.route("/settings/general", methods=["POST"])
@token_auth.login_required
def settings_general():
    """ Edit the general settings of the current user """

    try:
        data = request.get_json()
        username = data.get("username")
        send_feed_emails = data.get("send_feed_emails", current_user.send_feed_emails)
        max_articles_per_email = int(data.get("max_articles_per_email", current_user.max_articles_per_email))
    except:
        return abort(400, "Invalid request")

    if username:
        if User.query.filter_by(username=username).first():
            return abort(400, "Username already exists")

        if len(username) < 3 or len(username) > 15:
            return abort(400, "Username must be between 3 and 15 characters")

        current_user.username = username

    if max_articles_per_email < 1 or max_articles_per_email > 50:
        return abort(400, "Max articles per email must be between 1 and 50")

    current_user.send_feed_emails = send_feed_emails
    current_user.max_articles_per_email = max_articles_per_email

    db.session.commit()

    return jsonify(data=current_user.to_dict()), 200


@main.route("/settings/password", methods=["POST"])
@token_auth.login_required
def settings_password():
    """ Edit the password of the current user """

    try:
        data = request.get_json()
        current_password = data["current_password"]
        new_password = data["new_password"]
    except:
        return abort(400, "Invalid request")

    if not current_user.verify_password(current_password):
        return abort(401, "Invalid password")

    current_user.password = new_password
    db.session.commit()

    return jsonify(data=current_user.to_dict()), 200


@main.route("/add_rss_feed", methods=["POST"])
@token_auth.login_required
def add_rss_feed():
    """ Add a new RSS feed globally and to the current user """

    try:
        data = request.get_json()
        publisher = data["publisher"]
        journal = data["journal"]
        url = data["url"]
    except:
        return abort(400, "Invalid request")

    new_rss_feed = RssFeed.add_rss_feed(publisher, journal, url)
    if not new_rss_feed:
        return abort(400, "Global RSS feed already exists")

    db.session.commit()

    return {}, 204


@main.route("/save_rss_feeds", methods=["POST"])
@token_auth.login_required
def save_rss_feeds():
    """ Save the current user configured RSS feeds """

    try:
        data = request.get_json()
        rss_feeds_ids = data["rss_feeds_ids"]
    except:
        return abort(400, "Invalid request")

    UserRssFeed.save_rss_feeds(current_user, rss_feeds_ids)
    db.session.commit()

    return {}, 204


@main.route("/add_keyword", methods=["POST"])
@token_auth.login_required
def add_keyword():
    """ Add a new keyword """

    try:
        data = request.get_json()
        name = data["name"]
    except:
        return abort(400, "Invalid request")

    new_keyword = Keyword.add_keyword(current_user, name)
    if not new_keyword:
        return abort(400, "Keyword already exists")

    db.session.commit()

    return {}, 204


@main.route("/toggle_keyword", methods=["POST"])
@token_auth.login_required
def toggle_keyword():
    """ Toggle a keyword """

    try:
        data = request.get_json()
        keyword_id = data["keyword_id"]
        active = data["active"]
    except:
        return abort(400, "Invalid request")

    Keyword.toggle_keyword(current_user, keyword_id, active)
    db.session.commit()

    return {}, 204


@main.route("/delete_keyword", methods=["POST"])
@token_auth.login_required
def delete_keyword():
    """ Delete a keyword """

    try:
        data = request.get_json()
        keyword_id = data["keyword_id"]
    except:
        return abort(400, "Invalid request")

    Keyword.delete_keyword(current_user, keyword_id)
    db.session.commit()

    return {}, 204


@main.route("/toggle_article_read", methods=["POST"])
@token_auth.login_required
def toggle_article_read():
    """ Toggle the read status of an article """

    try:
        data = request.get_json()
        article_id = data["article_id"]
        read = data["read"]
    except:
        return abort(400, "Invalid request")

    UserArticle.toggle_article_read(current_user, article_id, read)
    db.session.commit()

    return {}, 204


@main.route("/toggle_archive_article", methods=["POST"])
@token_auth.login_required
def toggle_archive_article():
    """ Toggle the archive status of an article """

    try:
        data = request.get_json()
        article_id = data["article_id"]
        archive = data["archive"]
    except:
        return abort(400, "Invalid request")

    UserArticle.toggle_article_archive(current_user, article_id, archive)
    db.session.commit()

    return {}, 204


@main.route("/delete_article", methods=["POST"])
@token_auth.login_required
def delete_article():
    """ Delete a user article """

    try:
        data = request.get_json()
        article_id = data["article_id"]
    except:
        return abort(400, "Invalid request")

    UserArticle.delete_article(current_user, article_id)
    db.session.commit()

    return {}, 204


@main.route("/fetch_user_rss", methods=["GET"])
@token_auth.login_required
def fetch_user_rss():
    """ Fetch the RSS Feeds of the current user """

    from backend.cli.tasks import fetch_and_filter_articles_one_user

    if current_user.last_rss_update and datetime.utcnow() < current_user.last_rss_update + timedelta(minutes=current_app.config["DELTA_MINUTES"]):
        diff = (current_user.last_rss_update + timedelta(minutes=current_app.config["DELTA_MINUTES"])) - datetime.utcnow()
        diff_in_minutes = diff.total_seconds() // 60
        return jsonify(data=f"Rss Fetcher will be up in {int(diff_in_minutes)} minutes"), 200

    current_user.last_rss_update = datetime.utcnow()
    db.session.commit()

    fetch_and_filter_articles_one_user(current_user)

    return {}, 204
