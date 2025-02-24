## ScienceFeed

[ScienceFeed](https://science-feed.mylists.info) is a platform allowing you to follow RSS feeds from scientific journals
and get updates based on keywords.

## Key Features

* Add personalized keywords
* Add RSS feeds from scientific journals
* Mark articles as read or unread, archived or deleted
* Get mail notifications when new articles are published every week
* ...

## Support Me

If you like this work, you can buy me a coffee! &nbsp;
[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/crossoufire)

---

# Local Deployment

## Prerequisites

* Docker on WSL2

## Steps

1. Clone this repo

```
git clone https://www.github.com/Crossoufire/ScienceFeed.git
cd ScienceFeed
```

2. Update the `.env.example` file in the `backend` folder with your own values.

```
cd ScienceFeed/backend
cp .env.example .env
```

3. Update the `.env.example` file in the `frontend` folder with your own values.

```
cd ScienceFeed/frontend
cp .env.example .env
```

4. Go back to the `ScienceFeed` folder root, and run the command:

```
sudo docker compose up -d --build
```

5. The site will be served by default at `localhost:2000`.

6. To stop the container, run the command:

```
sudo docker compose down
```

---

# Installation for development

## Backend Installation (Python - Flask)

### Prerequisites

* Python 3.10+
* uv (recommended)

### Steps

1. Clone this repo and install the requirements using uv

```
git clone https://www.github.com/Crossoufire/ScienceFeed.git
cd ScienceFeed/backend
uv sync
```

3. Set up a `.flaskenv` file in the `backend` folder.

```
FLASK_APP=server.py
FLASK_ENV=<development|production>
```

4. Create a `.env` file. See the `config.py` file and the `.env.example` file in the `backend` folder for more details.

5. If using PowerShell (Windows), you need to set up the python path:

```
$env:PYTHONPATH = "$env:PYTHONPATH;path\to\ScienceFeed"
```

5. Run the command `uv run backend\server.py` from the `ScienceFeed` root folder.
6. The backend will be served by default at `localhost:5000`.

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

2. Create a `.env` file. See the `.env.example` file in the `frontend` folder for more details.

3. Run the command `npm run dev` inside the `ScienceFeed/frontend` folder.
4. The frontend will be served by default at `localhost:3000`.
