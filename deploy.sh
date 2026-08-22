#!/bin/bash

set -e

IMAGE_TAG="$1"

if [ -z "$IMAGE_TAG" ]; then
    echo "Error: image tag is required"
    exit 1
fi

export IMAGE_TAG

docker compose pull api
docker compose up -d api
