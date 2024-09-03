#!/bin/sh
if ! docker ps | grep -q neo4j; then
    echo Starting docker
    docker run -d -p7474:7474 -p7687:7687 -e NEO4J_AUTH=neo4j/root neo4j:4.1.9
fi
project=$(basename -- "$1")
path=test_project/$project


echo Anlysing project: "$project"

cd app || exit
npm run --silent build

PROJECT_PATH=$path node lib/index.js
