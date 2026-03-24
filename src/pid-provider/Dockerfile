FROM python:3.13-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ .

CMD sh /app/keys/generate.sh && \
    update-ca-certificates && \
    hypercorn app:app --bind "0.0.0.0:8000"