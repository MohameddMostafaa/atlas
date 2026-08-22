#!/bin/bash

set -e

IMAGE_TAG="$1"

if [ -z "$IMAGE_TAG" ]; then
    echo "Error: image tag is required"
    exit 1
fi

export IMAGE_TAG

echo "Deploying image: $IMAGE_TAG"

docker compose pull api
docker compose up -d api

echo "Waiting for API to become healthy..."

for i in {1..30}; do
    if curl --fail --silent http://localhost/health > /dev/null; then
        echo "API is healthy."
        exit 0
    fi

    echo "API not ready yet... attempt $i/30"
    sleep 2
done

echo "ERROR: API failed to become healthy."

docker compose ps
docker compose logs --tail=100 api

exit 1
