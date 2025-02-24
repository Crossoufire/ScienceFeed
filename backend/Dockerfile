# Use a Python image with uv pre-installed
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

# Install project into `/app/backend`
WORKDIR /app/backend

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
ADD . /app/backend
RUN --mount=type=cache,target=/root/.cache/uv uv sync --frozen --no-dev

# Place executables in env and add project to PYTHONPATH
ENV PATH="/app/backend/.venv/bin:$PATH"
ENV PYTHONPATH="$PYTHONPATH:/app"

# Expose Flask app port
EXPOSE 5000

CMD ["uv", "run", "gunicorn", "-b", "0.0.0.0:5000", "-w", "1", "server:app", "--preload"]
