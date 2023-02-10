if [ ! -d experiments ]; then
    mkdir experiments
fi

if ! docker ps | grep -q neo4j; then
    echo Starting docker
    ./start_neo4j.sh
fi
project=$(basename -- $1)
path=experiments/$project

if [ ! -d $path ]; then
    echo Download at $1
    mkdir download
    cd download
    wget -q --show-progress -O $project.zip $1/archive/master.zip
    if [ ! -f $project.zip ]; then
        echo Project \'$project\' not find...
        cd ..
        rm -rd download
        exit 1
    fi
    unzip -q $project.zip
    rm $project.zip
    mv $(ls) ../experiments/$project
    cd ..
    rm -d download
fi

echo Anlysing project: $project

cd app
npm run --silent build

PROJECT_PATH=$path UV_THREADPOOL_SIZE=$(nproc) node lib/index.js
