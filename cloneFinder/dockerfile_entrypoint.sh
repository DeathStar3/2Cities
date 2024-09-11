#!/bin/bash
HTTP_PATH="http://varicity-backend:3000/projects"
PROJECT_=""
TASK=""
DETECTION="1"

set_http()
{
  HTTP_PATH="$1"
  if [ "$HTTP_PATH" = "" ]; then
    HTTP_PATH=http://varicity-backend:3000/projects
    echo "No server url provided. Using default one \"$HTTP_PATH\"."
  else
    echo "Path to server manually defined."
    echo "HTTP_PATH : $HTTP_PATH"
    echo
  fi
}

set_detection()
{
    DETECTION="$1"
      if [ "$DETECTION" = "" ]; then
    DETECTION=1
    echo "No specific detection. Using the first one."
  else
    echo "Specific detection required"
    echo "DETECTION : $DETECTION"
    echo
  fi
}


NB_MAX_ARGS=$#
NB_ARG=0
# Parse the arguments
while true; do
  if [ "$NB_ARG" -ge "$NB_MAX_ARGS" ]; then
      break
  fi
  # let NB_ARG++
  NB_ARG=$((NB_ARG+1))
  case "$1" in
  #-http) set_http "$2"; shift 2;; # Output http path
  -project) PROJECT="$2" ; shift 2;; # set project name to analyze
  -task) TASK="$2"; shift 2;; # set task id to parse
  #-detection) set_detection "$2"; shift 2;; # set detection id to parse
  esac
done

if [ "$PROJECT" = "" ];then
  echo "Have to provide a project name to run. Exiting..."
  exit 22
fi

echo "Analyzing project \"$PROJECT\"."
if [ "$HTTP_PATH" != "" ]; then
  echo "Project results will be send to server \"$HTTP_PATH\""
fi

export HTTP_PATH
export PROJECT
export TASK
export DETECTION

python3 main.py $TASK $DETECTION $PROJECT $HTTP_PATH