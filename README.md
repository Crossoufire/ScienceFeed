# ScienceFeed

[ScienceFeed](https://science-feed.mylists.info) is a platform allowing you to follow RSS feeds from scientific journals
and get updates based on keywords.

contact: <contact.us.at.mylists@gmail.com>

# Key Features

* Add personalized keywords
* Add RSS feeds from scientific journals
* Mark articles as read or unread, archived or deleted
* Get mail notifications when new articles are published every week
* ...

# Support Me

If you like this work, you can buy me a coffee! &nbsp;
[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/crossoufire)

---

# Backend Installation (Python - Flask)

## Prerequisites

* Python 3.10+
* UV (recommanded)

## Steps

1. Clone this repo and install the requirements using UV

```
git clone https://www.github.com/Crossoufire/ScienceFeed.git
cd ScienceFeed/backend
uv sync
```

3. Set up the `.flaskenv` file

```
FLASK_APP=server.py
FLASK_ENV=<development|production>
```

4. Create a `.env` file. See the `config.py` file for more details.

```
SECRET_KEY=<change-me>

MAIL_SERVER=<your-mail-server>
MAIL_PORT=<port>
MAIL_USE_TLS=<True|False>
MAIL_USE_SSL=<True|False>
MAIL_USERNAME=<mail@mail.com>
MAIL_PASSWORD=<password>
```

5. Run the command `uv run python server.py` inside the `ScienceFeed/backend` folder.
   The backend will be served by default at `localhost:5000`.

---

# Frontend Installation (Node - React)

## Prerequisites

- npm > 9.0
- Node.js > 19.0

## Steps

1. Clone this repo and install the requirements using npm

```
git clone https://www.github.com/Crossoufire/ScienceFeed.git
cd ScienceFeed/frontend
npm install
```

2. Create the `.env.development` file for development (`.env.production` for production)

```
VITE_BASE_API_URL=http://localhost:5000
VITE_REGISTER_CALLBACK=http://localhost:3000/register_token
VITE_RESET_PASSWORD_CALLBACK=http://localhost:3000/reset_password
```

3. Run the command `npm run dev` inside the `ScienceFeed/frontend` folder. The frontend will be served by default at `localhost:3000`.

