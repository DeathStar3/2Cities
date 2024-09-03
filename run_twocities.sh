#!/usr/bin/env bash
set -e

create_directory(){
    if [[ ! -d "$1" ]]; then
        echo "Creating $1 directory"
        mkdir "$1"
    else
        echo "$1 directory already exists"
    fi
}

kill_container(){
  docker-compose -f varicity-front-back.docker-compose.yaml down
  docker rmi deathstar3/varimetrics:local -f
}

# Blank value means option unset
DEV=false
DETACH=
while getopts ":dv" option
do
    case $option in
      d)
        # Use detach mode
        DETACH="-d"
        ;;
      v)
        # Use vite which means use dev mode
        DEV=true
        ;;
      \?)
        break
        ;;
    esac
done

export SYMFINDER_UID=$(id -u)
export SYMFINDER_GID=$(id -g)
export SYMFINDER_VERSION=$(git rev-parse HEAD)
export TAG=splc24
export DIR_PATH=$(pwd)
export VOLUME_PATH=$(pwd)/dockervolume

create_directory resources
create_directory data
create_directory dockervolume

docker network ls | grep varicity-config > /dev/null || docker network create --driver bridge varicity-config

if $DEV
then
  trap "kill_container" INT
fi

docker compose -f varicity-front-back.docker-compose.yaml up $DETACH
