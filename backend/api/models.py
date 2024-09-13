from __future__ import annotations

import secrets
from datetime import datetime, timedelta
from typing import Dict, Optional, List
from time import time

import jwt
from flask import current_app
from sqlalchemy import select, delete
from werkzeug.security import check_password_hash, generate_password_hash

from backend.api.app import db


user_article_keyword = db.Table(
    "user_article_keyword",
    db.Column("user_article_id", db.Integer, db.ForeignKey("user_article.id")),
    db.Column("keyword_id", db.Integer, db.ForeignKey("keyword.id")),
)


class Token(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), index=True)
    access_token = db.Column(db.String, nullable=False, index=True)
    access_expiration = db.Column(db.DateTime, nullable=False)
    refresh_token = db.Column(db.String, nullable=False, index=True)
    refresh_expiration = db.Column(db.DateTime, nullable=False)

    # --- Relationships ------------------------------------------------------------
    user = db.relationship("User", back_populates="token", lazy="select")

    def generate(self):
        self.access_token = secrets.token_urlsafe()
        self.access_expiration = datetime.utcnow() + timedelta(minutes=current_app.config["ACCESS_TOKEN_MINUTES"])
        self.refresh_token = secrets.token_urlsafe()
        self.refresh_expiration = datetime.utcnow() + timedelta(days=current_app.config["REFRESH_TOKEN_DAYS"])

    def expire(self, delay: int = None):
        # Add 5 second delay for simultaneous requests
        if delay is None:
            delay = 5 if not current_app.testing else 0

        self.access_expiration = datetime.utcnow() + timedelta(seconds=delay)
        self.refresh_expiration = datetime.utcnow() + timedelta(seconds=delay)

    @classmethod
    def clean(cls):
        yesterday = datetime.utcnow() - timedelta(days=1)
        cls.query.filter(cls.refresh_expiration < yesterday).delete()
        db.session.commit()


class User(db.Model):
    def __repr__(self):
        return f"<{self.username} - {self.id}>"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    registered_on = db.Column(db.DateTime, nullable=False)
    last_seen = db.Column(db.DateTime, default=datetime.utcnow)
    active = db.Column(db.Boolean, default=False)
    password_hash = db.Column(db.String)
    send_feed_emails = db.Column(db.Boolean, default=True)
    max_articles_per_email = db.Column(db.Integer, default=20)
    last_rss_update = db.Column(db.DateTime)

    # --- Relationships ----------------------------------------------------------------
    token = db.relationship("Token", back_populates="user", lazy="noload")
    rss_feeds = db.relationship("UserRssFeed", back_populates="user", lazy="select")
    articles = db.relationship("UserArticle", back_populates="user", lazy="select")
    keywords = db.relationship("Keyword", back_populates="user", lazy="select")

    @property
    def password(self):
        raise AttributeError("password is a read-only property")

    @password.setter
    def password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def to_dict(self) -> Dict:
        data = dict(
            id=self.id,
            username=self.username,
            registered_on=self.registered_on,
            last_seen=self.last_seen,
            send_feed_emails=self.send_feed_emails,
            max_articles_per_email=self.max_articles_per_email,
            last_rss_update=self.last_rss_update,
        )
        return data

    def verify_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def ping(self):
        self.last_seen = datetime.utcnow()

    def revoke_all_tokens(self):
        Token.query.filter(Token.user == self).delete()
        db.session.commit()

    def generate_auth_token(self) -> Token:
        token = Token(user=self)
        token.generate()
        return token

    def generate_jwt_token(self, expires_in: int = 600) -> str:
        token = jwt.encode(
            payload={"token": self.id, "exp": time() + expires_in},
            key=current_app.config["SECRET_KEY"],
            algorithm="HS256",
        )
        return token

    @staticmethod
    def verify_access_token(access_token: str) -> User:
        token = db.session.scalar(select(Token).where(Token.access_token == access_token))
        if token:
            if token.access_expiration > datetime.utcnow():
                token.user.ping()
                db.session.commit()
                return token.user

    @staticmethod
    def verify_refresh_token(refresh_token: str, access_token: str) -> Optional[Token]:
        token = Token.query.filter_by(refresh_token=refresh_token, access_token=access_token).first()
        if token:
            if token.refresh_expiration > datetime.utcnow():
                return token

            # Try to refresh with expired token: revoke all tokens from user as precaution
            token.user.revoke_all_tokens()
            db.session.commit()

    @staticmethod
    def verify_jwt_token(token: str) -> User | None:
        try:
            user_id = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])["token"]
        except:
            return None
        return User.query.filter_by(id=user_id).first()


class Keyword(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), index=True)
    name = db.Column(db.String, nullable=False, index=True)
    active = db.Column(db.Boolean, nullable=False, default=True, index=True)

    # --- Relationships ------------------------------------------------------------
    user = db.relationship("User", back_populates="keywords", lazy="select")
    articles = db.relationship("UserArticle", secondary=user_article_keyword, back_populates="keywords", lazy="select")

    def to_dict(self) -> Dict:
        all_articles = self.articles

        data = dict(
            id=self.id,
            name=self.name,
            count=len(self.articles),
            count_archived=len([article for article in all_articles if article.is_archived]),
            count_read=len([article for article in all_articles if article.is_read]),
            active=self.active,
        )

        return data

    @classmethod
    def add_keyword(cls, user: User, name: str) -> Optional[Keyword]:
        if cls.query.filter_by(user_id=user.id, name=name).first():
            return None

        new_keyword = cls(user_id=user.id, name=name)
        db.session.add(new_keyword)

        return new_keyword

    @classmethod
    def toggle_keyword(cls, user: User, keyword_id: int, active: bool):
        keyword = cls.query.filter_by(user_id=user.id, id=keyword_id).first()
        if not keyword:
            return
        keyword.active = active

    @classmethod
    def get_all_keywords(cls, user: User) -> List[Keyword]:
        return cls.query.filter_by(user_id=user.id).all()

    @classmethod
    def delete_keyword(cls, user: User, keyword_id: int):
        keyword = cls.query.filter_by(user_id=user.id, id=keyword_id).first()
        if not keyword:
            return None

        linked_articles = keyword.articles

        for article in linked_articles:
            article.keywords.remove(keyword)
            if not article.keywords:
                db.session.delete(article)

        db.session.delete(keyword)
        db.session.execute(delete(user_article_keyword).where(user_article_keyword.c.keyword_id == keyword_id))


class RssFeed(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    publisher = db.Column(db.String, nullable=False)
    journal = db.Column(db.String, nullable=False)
    url = db.Column(db.String, nullable=False, unique=True)

    # --- Relationships ------------------------------------------------------------
    articles = db.relationship("Article", back_populates="rss_feed", lazy="select")
    user_feeds = db.relationship("UserRssFeed", back_populates="rss_feed", lazy="select")

    def to_dict(self) -> Dict:
        data = dict(
            id=self.id,
            url=self.url,
            journal=self.journal,
            publisher=self.publisher,
        )
        return data

    @classmethod
    def add_rss_feed(cls, publisher: str, journal: str, url: str) -> Optional[RssFeed]:
        if cls.query.filter_by(publisher=publisher, journal=journal, url=url).first():
            return None

        new_rss_feed = cls(publisher=publisher, journal=journal, url=url)
        db.session.add(new_rss_feed)

        return new_rss_feed

    @classmethod
    def get_all_rss_feeds(cls) -> List[RssFeed]:
        return cls.query.all()


class Article(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    rss_feed_id = db.Column(db.Integer, db.ForeignKey("rss_feed.id"), index=True)
    title = db.Column(db.String, nullable=False)
    link = db.Column(db.String, nullable=False)
    summary = db.Column(db.String, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # --- Relationships ------------------------------------------------------------
    rss_feed = db.relationship("RssFeed", back_populates="articles", lazy="select")
    user_articles = db.relationship("UserArticle", back_populates="article", lazy="select")

    def to_dict(self) -> Dict:
        data = dict(
            id=self.id,
            rss_feed_id=self.rss_feed.id,
            title=self.title,
            link=self.link,
            summary=self.summary,
            publisher=self.rss_feed.publisher,
            journal=self.rss_feed.journal,
            url=self.rss_feed.url,
        )
        return data

    @classmethod
    def get_article_by_id(cls, article_id: int) -> Optional[Article]:
        return cls.query.filter_by(id=article_id).first()

    @classmethod
    def get_articles_with_active_keywords(cls) -> List[Article]:
        return cls.query.filter(Article.keywords.any(Keyword.active == True), Article.is_archived.is_not(True)).all()

    @classmethod
    def toggle_article_read(cls, article_id: int, read: bool):
        article = cls.get_article_by_id(article_id)
        if not article:
            return None
        article.is_read = read

    @classmethod
    def toggle_article_archive(cls, article_id: int, archive: bool):
        article = cls.get_article_by_id(article_id)
        if not article:
            return
        article.is_read = archive
        article.is_archived = archive


class UserRssFeed(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), index=True)
    rss_feed_id = db.Column(db.Integer, db.ForeignKey("rss_feed.id"), index=True)

    # --- Relationships ------------------------------------------------------------
    user = db.relationship("User", back_populates="rss_feeds", lazy="select")
    rss_feed = db.relationship("RssFeed", back_populates="user_feeds", lazy="joined")

    def to_dict(self) -> Dict:
        return {**self.rss_feed.to_dict()}

    @classmethod
    def get_all_rss_feeds(cls, user: User) -> List[UserRssFeed]:
        return cls.query.filter_by(user_id=user.id).all()

    @classmethod
    def add_rss_feed(cls, user: User, rss_feed_id: int) -> Optional[UserRssFeed]:
        user_feed = cls.query.filter_by(user_id=user.id, rss_feed_id=rss_feed_id).first()
        if user_feed:
            return None

        user_feed = cls(user_id=user.id, rss_feed_id=rss_feed_id)
        db.session.add(user_feed)

        return user_feed

    @classmethod
    def save_rss_feeds(cls, user: User, rss_feed_ids: List[int]):
        feeds = cls.query.filter_by(user_id=user.id).all()
        for feed in feeds:
            if feed.rss_feed_id not in rss_feed_ids:
                db.session.delete(feed)

        for rss_feed_id in rss_feed_ids:
            if not cls.query.filter_by(user_id=user.id, rss_feed_id=rss_feed_id).first():
                db.session.add(cls(user_id=user.id, rss_feed_id=rss_feed_id))


class UserArticle(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    article_id = db.Column(db.Integer, db.ForeignKey("article.id"))
    is_read = db.Column(db.Boolean, default=False)
    is_archived = db.Column(db.Boolean, default=False)
    is_deleted = db.Column(db.Boolean, default=False)

    # --- Relationships ------------------------------------------------------------
    user = db.relationship("User", back_populates="articles", lazy="select")
    article = db.relationship("Article", back_populates="user_articles", lazy="joined")
    keywords = db.relationship("Keyword", secondary=user_article_keyword, back_populates="articles", lazy="joined")

    def to_dict(self) -> Dict:
        data = dict(
            user_article_id=self.id,
            user_id=self.user.id,
            is_read=self.is_read,
            is_archived=self.is_archived,
            keywords=[keyword.name for keyword in self.keywords],
            **self.article.to_dict(),
        )
        return data

    @classmethod
    def get_articles_with_active_keywords(cls, user: User) -> List[UserArticle]:
        return (
            cls.query.filter_by(user_id=user.id)
            .filter(
                UserArticle.keywords.any(Keyword.active == True and Keyword.user_id == user.id),
                UserArticle.is_archived == False,
            ).all()
        )

    @classmethod
    def toggle_article_read(cls, user: User, article_id: int, read: bool):
        metadata = cls.query.filter_by(user_id=user.id, article_id=article_id).first()
        if not metadata:
            return None
        metadata.is_read = read

    @classmethod
    def toggle_article_archive(cls, user: User, article_id: int, archive: bool):
        metadata = cls.query.filter_by(user_id=user.id, article_id=article_id).first()
        if not metadata:
            return None
        metadata.is_read = archive
        metadata.is_archived = archive

    @classmethod
    def delete_article(cls, user: User, article_id: int):
        metadata = cls.query.filter_by(user_id=user.id, article_id=article_id).first()
        if not metadata:
            return None

        metadata.is_read = True
        metadata.is_archived = True
        metadata.is_deleted = True
