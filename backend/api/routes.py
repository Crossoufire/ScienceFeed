from datetime import datetime, timedelta

from flask import Blueprint, jsonify, request, abort, current_app
from sqlalchemy import or_, and_

from backend.api.app import db
from backend.api.handlers import current_user, token_auth
from backend.api.models import Keyword, RssFeed, UserRssFeed, UserArticle, User, Article


main = Blueprint("main_api", __name__)


@main.route("/current_user", methods=["GET"])
@token_auth.login_required
def get_current_user():
    return current_user.to_dict(), 200


@main.route("/user/keywords", methods=["GET"])
@token_auth.login_required
def get_user_keywords():
    """ Get all user created keywords """
    return jsonify(data=[keyword.to_dict() for keyword in Keyword.get_user_keywords(current_user)]), 200


@main.route("/user/rss_feeds", methods=["GET"])
@token_auth.login_required
def get_user_rss_feeds():
    """ Get all user's RSS feeds """
    return jsonify(data=[feed.to_dict() for feed in UserRssFeed.get_user_rss_feeds(current_user)]), 200


@main.route("/rss_feed/search", methods=["GET"])
@token_auth.login_required
def rss_feed_search():
    """ Search the RSS Feeds database """

    q = request.args.get("q", "")

    results = (
        RssFeed.query.filter(or_(
            RssFeed.publisher.ilike(f"%{q}%"),
            RssFeed.journal.ilike(f"%{q}%"),
        )).all()
    )

    user_feeds = UserRssFeed.query.filter(
        UserRssFeed.user_id == current_user.id,
        UserRssFeed.rss_feed_id.in_([rss_feed.id for rss_feed in results])
    ).all()

    user_feeds = [user_feed.rss_feed_id for user_feed in user_feeds]

    data = []
    for result in results:
        toto = result.to_dict()
        if result.id in user_feeds:
            toto["is_active"] = True
        data.append(toto)

    return jsonify(data=data), 200


@main.route("/dashboard", methods=["GET"])
@token_auth.login_required
def dashboard():
    """ User's dashboard page """

    page = int(request.args.get("page", 1))
    search = request.args.get("search", None)
    keywords_ids = request.args.get("keywords_ids").split(",") if request.args.get("keywords_ids") else []

    base_query = UserArticle.query.filter(
        UserArticle.user_id == current_user.id,
        UserArticle.is_archived == False,
        UserArticle.is_deleted == False,
    )

    if search:
        base_query = base_query.filter(
            or_(UserArticle.article.has(Article.title.ilike(f"%{search}%")),
                UserArticle.article.has(Article.summary.ilike(f"%{search}%")))
        )

    if keywords_ids:
        base_query = base_query.filter(
            UserArticle.keywords.any(and_(
                Keyword.active == True,
                Keyword.id.in_(keywords_ids),
                Keyword.user_id == current_user.id,
            ))
        )
    else:
        base_query = base_query.filter(UserArticle.keywords.any(Keyword.active == True and Keyword.user_id == current_user.id))

    results = base_query.order_by(UserArticle.added_date).paginate(page=page, per_page=20, error_out=True)

    keywords = (
        Keyword.query.join(UserArticle.keywords).filter(
            Keyword.active == True,
            UserArticle.user_id == current_user.id,
        ).distinct().all()
    )

    data = dict(
        articles=[article.to_dict() for article in results.items],
        keywords=[keyword.to_dict(simple=True) for keyword in keywords],
        page=results.page,
        pages=results.pages,
        total=results.total,
        per_page=results.per_page
    )

    return jsonify(data=data), 200


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
        return abort(400, description="Invalid request")

    if username:
        if User.query.filter_by(username=username).first():
            return abort(400, description="Username already exists")

        if len(username) < 3 or len(username) > 15:
            return abort(400, description="Username must be between 3 and 15 characters")

        current_user.username = username

    if max_articles_per_email < 1 or max_articles_per_email > 50:
        return abort(400, description="Max articles per email must be between 1 and 50")

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
        return abort(400, description="Invalid request")

    if not current_user.verify_password(current_password):
        return abort(401, description="Invalid password")

    current_user.password = new_password
    db.session.commit()

    return jsonify(data=current_user.to_dict()), 200


@main.route("/rss_feed/create", methods=["POST"])
@token_auth.login_required
def create_rss_feed():
    """ Create a new RSS feed globally and add it to the current user """

    try:
        data = request.get_json()
        publisher = data["publisher"]
        journal = data["journal"]
        url = data["url"]
    except:
        return abort(400, description="Invalid request")

    new_feed = RssFeed.create_new_rss_feed(publisher, journal, url)
    if not new_feed:
        return abort(400, description="This RSS feed already exists")

    UserRssFeed.add_user_rss_feeds(current_user, [new_feed.id])
    db.session.commit()

    return {}, 204


@main.route("/user/rss_feed/add", methods=["POST"])
@token_auth.login_required
def add_rss_feeds_to_user():
    """ Add the selected RSS feeds to the current user """

    try:
        data = request.get_json()
        feeds_ids = data["feeds_ids"]
    except:
        return abort(400, description="Invalid request")

    UserRssFeed.add_user_rss_feeds(current_user, feeds_ids)
    db.session.commit()

    return {}, 204


@main.route("/user/rss_feed/remove", methods=["POST"])
@token_auth.login_required
def remove_rss_feeds_from_user():
    """ Remove user's added RSS feeds """

    try:
        data = request.get_json()
        rss_ids = data["rss_ids"]
    except:
        return abort(400, description="Invalid request")

    UserRssFeed.remove_user_rss_feeds(current_user, rss_ids)
    db.session.commit()

    return {}, 204


@main.route("/user/add_keyword", methods=["POST"])
@token_auth.login_required
def add_user_keyword():
    """ Add a new keyword for the current user """

    try:
        data = request.get_json()
        name = data["name"]
    except:
        return abort(400, description="Invalid request")

    new_keyword = Keyword.add_keyword(current_user, name)
    if not new_keyword:
        return abort(400, description="Keyword already exists")

    db.session.commit()

    return {}, 204


@main.route("/user/toggle_keyword", methods=["POST"])
@token_auth.login_required
def toggle_user_keyword():
    """ Toggle the keyword (active/inactive) of the current user """

    try:
        data = request.get_json()
        active = data["active"]
        keyword_id = data["keyword_id"]
    except:
        return abort(400, description="Invalid request")

    Keyword.toggle_keyword(current_user, keyword_id, active)
    db.session.commit()

    return {}, 204


@main.route("/user/delete_keyword", methods=["POST"])
@token_auth.login_required
def delete_user_keyword():
    """ Delete the selected keyword for the current user """

    try:
        data = request.get_json()
        keyword_id = data["keyword_id"]
    except:
        return abort(400, description="Invalid request")

    Keyword.delete_keyword(current_user, keyword_id)
    db.session.commit()

    return {}, 204


@main.route("/user/toggle_articles_read", methods=["POST"])
@token_auth.login_required
def toggle_articles_read():
    """ Toggle the read status of user's articles """

    try:
        data = request.get_json()
        read_value = bool(data["read"])
        article_ids = data["article_ids"]
    except:
        return abort(400, description="Invalid request")

    UserArticle.toggle_read_articles(current_user, article_ids, read_value)
    db.session.commit()

    return {}, 204


@main.route("/user/archive_articles", methods=["POST"])
@token_auth.login_required
def archive_articles():
    """ Change the archive status of user's articles """

    try:
        data = request.get_json()
        archive = bool(data["archive"])
        article_ids = data["article_ids"]
    except:
        return abort(400, description="Invalid request")

    UserArticle.change_archive_articles(current_user, article_ids, archive)
    db.session.commit()

    return {}, 204


@main.route("/user/delete_articles", methods=["POST"])
@token_auth.login_required
def delete_articles():
    """ Change the delete status of user's articles """

    try:
        data = request.get_json()
        article_ids = data["article_ids"]
        delete = bool(data["is_deleted"])
    except:
        return abort(400, description="Invalid request")

    UserArticle.change_delete_articles(current_user, article_ids, delete)
    db.session.commit()

    return {}, 204


@main.route("/user/rss_feeds/refresh", methods=["GET"])
@token_auth.login_required
def fetch_user_rss_feeds():
    """ Refresh and fetch the current user's RSS Feeds """

    from backend.cli.tasks import fetch_and_filter_articles_one_user

    if (current_user.last_rss_update and datetime.utcnow() < current_user.last_rss_update +
            timedelta(minutes=current_app.config["DELTA_MINUTES"])):
        diff = (current_user.last_rss_update + timedelta(minutes=current_app.config["DELTA_MINUTES"])) - datetime.utcnow()
        diff_in_minutes = diff.total_seconds() // 60
        return jsonify(data=f"Rss Fetcher will be up in {int(diff_in_minutes)} minutes"), 200

    current_user.last_rss_update = datetime.utcnow()
    db.session.commit()

    fetch_and_filter_articles_one_user(current_user)

    return {}, 204
