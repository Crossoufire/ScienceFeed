import click
from sqlalchemy import text
from flask import current_app

from backend.api.app import db
from backend.cli.tasks import (seed_database, add_new_user, fetch_and_filter_articles, send_feed_emails,
                               delete_user_deleted_articles)


def create_cli_commands():
    """ Register commands to the Flask CLI """

    @current_app.cli.command()
    @click.argument("username")
    @click.argument("email")
    def add_user(username: str, email: str):
        """ Add a new user to the database. """
        add_new_user(username, email)

    @current_app.cli.command()
    def analyze_db():
        """ Run ANALYZE on SQLite. """
        db.session.execute(text("ANALYZE"))
        click.echo("ANALYZE operation completed successfully")

    @current_app.cli.command()
    def vacuum_db():
        """ Run VACUUM on SQLite. """
        db.session.execute(text("VACUUM"))
        click.echo("VACUUM operation completed successfully")

    @current_app.cli.command()
    def seed_db():
        """ Seed the database with RSS Feeds. """
        seed_database()

    @current_app.cli.command()
    @click.option("--user_id", "-u", default=None, help="Target user ID")
    def ffa(user_id: int = None):
        """ Fetch and filter articles. """
        fetch_and_filter_articles(user_id)

    @current_app.cli.command()
    def send_emails():
        """ Send feed emails. """
        send_feed_emails()

    @current_app.cli.command()
    def delete_deleted_articles():
        """ Delete user articles marked as deleted by the user after 2 months. """
        delete_user_deleted_articles()

    @current_app.cli.command()
    def daily_scheduled_tasks():
        """ Run daily scheduled tasks. """

        fetch_and_filter_articles()

        db.session.execute(text("VACUUM"))
        click.echo("VACUUM operation completed successfully")

        db.session.execute(text("ANALYZE"))
        click.echo("ANALYZE operation completed successfully")

    @current_app.cli.command()
    def weekly_scheduled_tasks():
        """ Run weekly scheduled tasks. """

        send_feed_emails()
        delete_user_deleted_articles()
