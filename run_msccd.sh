#!/bin/bash
set -e
TAG=splc24

EXP_VOLUME=$(pwd)/experiments_volume
TASKS_VOLUME=$(pwd)/tasks_volume

# If there are no container with the specify name, execute then
if [ ! "$(docker ps -a | grep msccd)" ] 
then
    echo Container does not exist, running it...
    docker run --platform linux/arm64 \
    --network varicity-config \
    --name msccd \
    -v $EXP_VOLUME:/root/MSCCD/experiments_volume \
    -v $TASKS_VOLUME:/root/MSCCD/tasks_volume \
    -it \
    deathstar3/msccd:${TAG} /bin/bash
else
    echo Container already exists, starting it...
    docker start msccd
    docker exec -it msccd /bin/bash
fi


