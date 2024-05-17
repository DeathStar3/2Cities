#!/bin/bash

set -e

TAG=local

cd js/app
echo "building the Symfinder-TS engine"
docker build -f Dockerfile -t deathstar3/symfinder-ts-cli:${TAG} .