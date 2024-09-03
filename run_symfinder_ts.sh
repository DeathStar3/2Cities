#!/bin/bash
set -e
TAG=splc24

VOLUME_PATH=$(pwd)/experiments_volume

cd symfinder-ts

if ! docker ps | grep -q neo4j; then
    echo Starting database container
    ./start_neo4j.sh
fi

echo Database running, starting engine container

docker run --rm \
    --network varicity-config \
    --name symfinder-ts-cli \
    -v $VOLUME_PATH:/app/experiments_volume \
    deathstar3/symfinder-ts-cli:${TAG} $@
