#!/bin/bash

set -e

IMAGE_TAG="$1"

if [ -z "$IMAGE_TAG" ]; then
    echo "Error: image tag is required"
    exit 1
fi

export IMAGE_TAG

echo "Deploying image: $IMAGE_TAG"

PREVIOUS_IMAGE=$(docker inspect atlas-api-1 \
    --format '{{.Config.Image}}' 2>/dev/null || true)

echo "Previous image: ${PREVIOUS_IMAGE:-none}"

docker compose pull api
docker compose up -d api

CURRENT_IMAGE=$(docker inspect atlas-api-1 \
    --format '{{.Config.Image}}')

echo "Current image: $CURRENT_IMAGE"

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

if [ -n "$PREVIOUS_IMAGE" ]; then
    echo "Rolling back to: $PREVIOUS_IMAGE"

    PREVIOUS_TAG="${PREVIOUS_IMAGE##*:}"
    export IMAGE_TAG="$PREVIOUS_TAG"

    docker compose pull api
    docker compose up -d api

    echo "Waiting for rollback to become healthy..."

    for i in {1..30}; do
        if curl --fail --silent http://localhost/health > /dev/null; then
            echo "Rollback successful."
            exit 1
        fi

        echo "Rollback not ready yet... attempt $i/30"
        sleep 2
    done

    echo "ERROR: Rollback also failed."
fi

exit 1
