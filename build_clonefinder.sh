#!/bin/bash

set -e

TAG=local

cd cloneFinder

echo "building CloneFinder CLI docker image..."
docker build -f dockerfile -t deathstar3/clonefinder-cli:${TAG} .