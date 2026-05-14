FROM public.ecr.aws/docker/library/python:3.13-slim
RUN apt-get update && apt-get install -y postgresql-client build-essential libpq-dev ca-certificates

RUN apt-get update && \
    apt-get install -y curl ca-certificates && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

ADD https://astral.sh/uv/install.sh /uv-installer.sh

RUN sh /uv-installer.sh && rm /uv-installer.sh
ENV PATH="/root/.local/bin/:$PATH"

WORKDIR /app

COPY . /app

RUN uv sync --locked

COPY . .
