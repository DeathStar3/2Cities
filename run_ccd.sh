#!/bin/bash
set -e
TAG=splc24

EXP_VOLUME=$(pwd)/experiments_volume
TASKS_VOLUME=$(pwd)/tasks_volume

PROJECT_NAME=""
CONFIG_FILE=""

if [ "$#" -ne 1 ]; then
    echo "need to provide project name, exiting..."
    exit 1
else
    PROJECT_NAME="$1"
    echo $PROJECT_NAME
    CONFIG_FILE="${PROJECT_NAME}.config.json"
    echo $CONFIG_FILE
fi
echo "here"
# If there are no container with the specify name, execute then
if [ ! "$(docker ps -a | grep msccd-test-cmd)" ] 
then
    echo "Container does not exist, creating it..."
    echo "running CDD on config $CONFIG_FILE"
    docker run --platform linux/arm64 \
    --network varicity-config \
    --name msccd-test-cmd \
    -v $EXP_VOLUME:/root/MSCCD/experiments_volume \
    -v $TASKS_VOLUME:/root/MSCCD/tasks_volume \
    -it \
    msccd:${TAG} /bin/bash -c "cd root/MSCCD && python3 controller.py $CONFIG_FILE"
    
else
    echo Container already exists, starting it...
    docker start msccd-test-cmd && docker exec -it msccd-test-cmd /bin/bash -c "cd root/MSCCD && python3 controller.py $CONFIG_FILE"
fi
