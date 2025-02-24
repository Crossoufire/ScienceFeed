# Use a Python image with uv pre-installed
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

# Install project into `/app`
WORKDIR /app

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1

# Copy from cache instead of linking since mounted volume
ENV UV_LINK_MODE=copy

# Install project dependencies using lockfile and settings
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project --no-dev

# Add rest of project source code and install it
ADD . /app
RUN --mount=type=cache,target=/root/.cache/uv uv sync --frozen --no-dev

# Place executables in env
ENV PATH="/app/.venv/bin:$PATH"

# Expose Flask app port
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=server.py
ENV FLASK_ENV=production

CMD ["gunicorn", "-b", "0.0.0.0:5000", "-w", "1", "backend.server:app", "--preload"]
