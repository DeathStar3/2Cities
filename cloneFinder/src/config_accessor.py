import yaml


CONFIG_FOLDER="./neo4j_config"

def getAdress(): 
    with open(f'{CONFIG_FOLDER}/docker.config.yaml', 'r') as f:
        data = yaml.load(f, Loader=yaml.SafeLoader)
    return data["neo4j"]["boltAddress"]

def getAuth():
    with open(f'{CONFIG_FOLDER}/docker.config.yaml', 'r') as f:
        data = yaml.load(f, Loader=yaml.SafeLoader)

    return (data["neo4j"]["user"], data["neo4j"]["password"])