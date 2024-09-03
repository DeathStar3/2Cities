#!/bin/bash
# if [ ! -d ./app/experiments ]; then
#     mkdir ./app/experiments
# fi
if [ ! -d ./app/export ]; then
    mkdir ./app/export
fi

if ! docker ps | grep -q neo4j; then
    echo Starting docker
    ./start_neo4j.sh
fi

# Environment variables
HTTP_PATH=""

################################################################################
# Functions
set_http()
{
  HTTP_PATH="$1"
  if [ "$HTTP_PATH" = "" ]; then
    HTTP_PATH=http://varicity-backend:3000/projects
    echo "Sending results to \"$HTTP_PATH\"."
  else
    echo "Path to server manually defined."
    echo "HTTP_PATH : $HTTP_PATH"
    echo
  fi
}

help()
{
  echo "USAGE: $0 [OPTIONS] PROJECT_URL"
  echo "Options:"
  echo " -http HTTP_PATH    Defined server to send result"
  echo " -h,  --help        Print this message"
  echo " -v,  --version     Print version (not yet implemented)"
  echo
}
################################################################################

# Parse the arguments
PROJECT_URL=""
ENGINE_RUNNER=""
NB_MAX_ARGS=$#
NB_ARG=0

while true; do
  if [ "$NB_ARG" -ge "$NB_MAX_ARGS" ]; then
      break
  fi
  let NB_ARG++
  echo "$1"
  case "$1" in
#  -http) set_http "$2"; shift 2;  ;; # Output http path
  -h |--help) # Help message
    help
    shift ;;
  http*) PROJECT_URL="$1" ; shift 1;; # Project path
  -runner) ENGINE_RUNNER="$2"; shift 2; ;;
  esac
done

if [ "$PROJECT_URL" = "" ];then
  echo "Have to provide a url for the project path. Exiting..."
  exit 22
fi

echo "Project \"$PROJECT_URL\" will be analyse."
if [ "$HTTP_PATH" != "" ]; then
  echo "Project results will be send to server \"$HTTP_PATH\""
fi
################################################################################
cd app

################################################################################
# Downloading the project
project=$(basename -- "$PROJECT_URL")
path=../../experiments_volume/$project

if [ ! -d "$path" ]; then
    echo Downloading...
    mkdir ./download
    cd ./download
    wget -q --show-progress -O "$project".zip "$PROJECT_URL"/archive/master.zip
    if [ ! -f "$project".zip ]; then
        echo Project \'"$project"\' not find...
        cd ..
        rm -rd download
        exit 1
    fi
    unzip -q "$project".zip
    rm "$project".zip
    mv $(ls) ../experiments_volume/"$project"
    cd ..
    rm -d download
fi

echo Anlysing project: "$project"
npm run --silent build

# Export environment variables
PROJECT_PATH=$path
UV_THREADPOOL_SIZE=$(nproc)
#export HTTP_PATH
export PROJECT_PATH
export ENGINE_RUNNER
export UV_THREADPOOL_SIZE

#echo "HTTP : $HTTP_PATH"
echo "PROJECT : $PROJECT_PATH"
echo "RUNNER : $ENGINE_RUNNER"
# Run Symfidner JS
node lib/index.js
