# VariCity-Config

<p align="center">
<img src="varicity/public/images/logovaricity.gif" width="200" alt="Logo"/>
</p>

**VariCity** is a 3D visualization relying on the city metaphor to display zones of high density of variability
implementations in a single system. The city is built by creating building, corresponding to classes, and streets,
grouping every class linked to the street's starting building.

**VariCity-backend** interact with the File System and combine the JSON generated by SymFinder and the JSON files for external metrics. It also manages the saving and loading of configurations files.

**SymFinder** is a toolchain parsing a single Java codebase to identify potential variability implementations.
The output of SymFinder consists in JSON files containing information on the presence of variability implementations in the analysed codebase (e.g. if a class has been identified as a variation point or a variant, number of variants of an identified variation point…).

**Metrics-extension** is a tool allowing you to retrieve additional metrics from external sources. It can be configured to retrieve quality metrics from SonarCloud given a URL, or can automatically pull a local SonarQube image to scan the given project.

**SymFinder-CLI** orchestrate the gathering of variability & quality metrics by running the Metric-Extension and Symfinder tools. They are called depending on configuration files and parameters given by the user.

## How to run the demo

The following demo will use the JUnit project with a custom ``pom.xml`` to build the project with coverage.
1. The first step will be a variability analysis performed by Symfinder.
2. After that we will retrieve five extra quality metrics using a local SonarQube generated container. 
   * Quality metrics to be gathered: complexity, cognitive_complexity, coverage, duplicated_lines and duplicated_lines_density.
3. The JSONs created will automatically be sent to the VariCity-Backend
4. The VariCity-Backend will parsed all the JSONs to regroup all the metrics and node data.
5. Using the VariCity UI you will be able to visualize the city of JUnit.


### Requirements

- Docker (CLI and deamon)
  - Instructions to install Docker are available [here](https://docs.docker.com/get-docker/).
- Docker-compose
  - Instructions to install Docker Compose are available [here](https://docs.docker.com/compose/install/#install-compose).
- JDK 17
  - The JAVA_HOME environment variable must be defined and pointing to a JDK >= 11
- Maven
  - Under Ubuntu, you need to manually install Maven 3.8.4+ to be compatible with JDK 17
- Internet connexion
  - To pull docker images
- Free disk space over 15 GB (To download the images and also because Sonarqube exits when disk space is low)

**Note:** By default, on a GNU/Linux host, Docker commands must be run using `sudo`.
Two options are available for you in order to run the project:
- Follow [these short steps](https://docs.docker.com/install/linux/linux-postinstall/#manage-docker-as-a-non-root-user) to allow your user to call Docker commands,
- Preface the scripts calls with `sudo`.

### Procedure

Build docker images
```shell
./build-docker-images.sh
```

```bat
./build-docker-images.bat
```

Run visualization
```shell
./run-compose.sh
```

```bat
./run-compose.bat
```

Run the analysis
```shell
./run-docker-cli.sh -i /data/junit-r4.13.2-config.yaml -s /data/symfinder.yaml -verbosity INFO -http http://varicityback:3000/projects
```

```bat
./run-docker-cli.bat -i /data/junit-r4.13.2-config.yaml -s /data/symfinder.yaml -verbosity INFO -http http://varicityback:3000/projects
```



Open your browser and go to [http://localhost:8000](http://localhost:8000) and select jour project. 
No worries if no city is displayed, go to the "APIs and Blacklist" menu on the right to define your entry points.

## Documentation
- [Go to symfinder's documentation](./metrics-extension/symfinder/README.md)
- [Go to metrics-extension's documentation](./metrics-extension/README.md)
- [Go to varicity-backend's documentation](./varicity-backend/README.md)
- [Go to varicity's documentation](./varicity/README.md)

## Authors

Authors | Contact
----------------------------------------------------------- | ----------------------------------------------------------
[Patrick Anagonou](https://github.com/anagonousourou)       | [sourou-patrick.anagonou@etu.univ-cotedazur.fr](mailto:sourou-patrick.anagonou@etu.univ-cotedazur.fr)
[Guillaume Savornin](https://github.com/GuillaumeSavornin)  | [guillaume.savornin@etu.univ-cotedazur.fr](mailto:guillaume.savornin@etu.univ-cotedazur.fr)
[Anton van der Tuijn](https://github.com/Anton-vanderTuijn) | [anton.van-der-tuijn@etu.univ-cotedazur.fr](mailto:anton.van-der-tuijn@etu.univ-cotedazur.fr)



<!--
TODO need to be move in the corresponding readme

## Technological Stack
- NestJs
- Quarkus
- Webpack
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="122" height="122" alt="Nest Logo" /></a>
<a href="http://nestjs.com/" target="blank"><img class="logo" src="https://webpack.js.org/site-logo.1fcab817090e78435061.svg" alt="webpack logo" width="122" height="122"></a>
</p>

## General Requirements
Those are general requirements, depending of the method you choose you won't need all of them.
- Docker (cli and deamon)
- Docker-Compose
- JDK 17
- the JAVA_HOME environment variable must be defined and pointing to a JDK >= 11
- Maven
- Internet Connexion
- Free disk space over 15 GB (To download the images and also because Sonarqube exits when disk space is low )
## Integrate in your own tool
This extension has been built in modular way. This makes it possible to insert 
## Symfinder with the terminal (console) interface
First you need to generate the data with symfinder.

### Without docker-cli
With this method you will need JDK 17 + `mvn`. You won't need the `docker` command but you will still need to have a docker
daemon. Use the below command to check if your docker daemon is runnig. (Command not tested on Windows).
```shell
curl --unix-socket /var/run/docker.sock http://localhost/version
```
First build the new Symfinder 
```shell
chmod +x new-build-cli.sh
./new-build-cli.sh
```
Then to use it  (replace <> by the right value for your usage). See below for details

```shell
chmod +x new-run-cli.sh
./new-run-cli.sh -i <experiment-configuration> -s <hotspot-configuration> -verbosity <LOG_LEVEL> -http <url>
```
| Options/Arguments         | Type    | Description |
|--------------|-----------|------------|
|-i | string | the absolute or relative path of the file containing your configuration for your experiment See [Documentation](Wiki.md) for the format of the file|
| -s | string | the absolute or relative path of the file containing your hotspot configuration. See [Documentation](Wiki.md) for the format of the file.|
| LOG_LEVEL | string | the verbosity of the program possible values are `"TRACE", "DEBUG", "INFO", "WARN", "ERROR"`. You can use any case (lowercase,uppercase) you want.|
| -http | string | An url where you want the result of the analysis to be posted using `HTTP/POST`. Eg `http://localhost:3000/projects`. Nothing will be written on disk if you use that option|

### With docker-cli
If you use this then you are using Docker out of Docker. The advantage is that you don't need Java or mvn on your machine
First build the image. 
```shell
chmod +x new-build-docker-cli.sh
./new-build-docker-cli.sh
```
Given you are using Docker you need to mount a volume to share files between your host and the docker container.
For the sake of simplicity, one (1) volume is enough. So put all your configurations files (experiments and hotspots) and projects (if already on the disk) in a directory /
sub-directories of where you are lauching your command.
The script mount your current directory to the docker container under `/data`. 
So for the path of the files your need to take that into account.
You need to take that into account for the `path` and `outputPath` in the experiments config.
If you are using the option `-http`, then you can't use `localhost` your url must be accessible through the internet or must be 
a docker container in the same network as symfinder-cli. There will be more details on this in other sections.
When using docker you need to provide a `path`.
```shell
chmod +x new-run-docker-cli.sh
./new-run-docker-cli.sh -i <experiment-configuration> -s <hotspot-configuration> -verbosity <LOG_LEVEL> -http <url>
```


## NB
Some dockerfiles or scripts have `local` in their filename. These are dockerfiles where the build part happens on the machine. 
It saves the developpers the time needed for the docker container (build) to download all dependencies from maven.
-->