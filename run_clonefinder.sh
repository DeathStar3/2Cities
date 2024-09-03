#!/bin/bash
set -e
TAG=splc24

VOLUME_PATH=$(pwd)/tasks_volume

cd cloneFinder

docker run --rm \
    --name clonefinder-cli \
    --network varicity-config \
    -v $VOLUME_PATH:/home/tasks_volume \
    deathstar3/clonefinder-cli:${TAG} $@
    