#!/bin/bash
set -e
TAG=splc24

EXP_VOLUME=$(pwd)/experiments_volume
TASKS_VOLUME=$(pwd)/tasks_volume

PROJECT_NAME=""
CONFIG_FILE=""

LOG_FILE="tmp_log.txt"

TASK_NUMBER=""

##########################################################################
# Functions

extract_task_number()
{
# Read the last line of the file
last_line=$(tail -n 1 "./tasks_volume/running_log/$LOG_FILE")

# Split the last line on '/' and iterate over each part
IFS='/' read -ra parts <<< "$last_line"

# Get the penultimate part (second-to-last element)
task="${parts[-2]}"

TASK_NUMBER="${task: -2}"

# Check if the last two characters are digits and print them
if [[ "$TASK_NUMBER" =~ ^[0-9]{2}$ ]]; then
    echo "$TASK_NUMBER"
else
    echo "Task number invalid. Analysis failed, exiting..."
    exit 1
fi
}

###########################################################################

if [ "$#" -ne 1 ]; then
    echo "need to provide project name, exiting..."
    exit 1
else
    PROJECT_NAME="$1"
    echo $PROJECT_NAME
    CONFIG_FILE="${PROJECT_NAME}.config.json"
    echo $CONFIG_FILE
fi

echo "running CDD on config $CONFIG_FILE..."
docker run --rm \
    --platform linux/arm64 \
    --network varicity-config \
    --name msccd \
    -v $EXP_VOLUME:/root/MSCCD/experiments_volume \
    -v $TASKS_VOLUME:/root/MSCCD/tasks_volume \
    -it \
    deathstar3/msccd:${TAG} /bin/bash -c "cd root/MSCCD && python3 controller.py $CONFIG_FILE" \
    > ./tasks_volume/running_log/$LOG_FILE

extract_task_number

cd cloneFinder

docker run --rm \
    --name clonefinder-cli \
    --network varicity-config \
    -v $TASKS_VOLUME:/home/tasks_volume \
    deathstar3/clonefinder-cli:${TAG} -task $TASK_NUMBER -project $PROJECT_NAME