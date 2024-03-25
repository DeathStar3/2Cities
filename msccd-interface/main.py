import json
import requests
import sys
from typing import List, Tuple, Dict


from neo4j_connector import Neo4jConnection
from prepare_data import extract_file_list, export_clone_data, write_file
from token_bag_parser import extract_bags_data

# URI examples: "neo4j://localhost", "neo4j+s://xxx.databases.neo4j.io"
URI = "bolt://localhost:7687"
AUTH = ("neo4j", "root")


class SymfinderResult:
    vp_json_graph: str = ""
    statistic_json: str = ""

class ExperimentResult:

    project_name: str
    symfinder_result: SymfinderResult

    def __init__(self, project_name: str) -> None:
        self.project_name = project_name
        self.symfinder_result = SymfinderResult()

def is_core_files(src_path: str, clone_path: str, neo4j_runner: Neo4jConnection) -> bool:
    src_node = neo4j_runner.get_node(src_path)
    src_labels = src_node[0][0].labels
    if "CORE_FILE" in src_labels:
        clone_node = neo4j_runner.get_node(clone_path)
        clone_labels = clone_node[0][0].labels
        return "CORE_FILE" in clone_labels 
    else:
        return False

def link_nodes(src_path: str, clones: List[Tuple], neo4j_runner: Neo4jConnection) -> None:
    for clone in clones:
        if is_core_files(src_path, clone[1], neo4j_runner):
            neo4j_runner.link_core(src_path, clone[1])
            neo4j_runner.link_clones(src_path, clone[1], clone[2], clone[3], clone[4])
        else:
            neo4j_runner.link_clones(src_path, clone[1], clone[2], clone[3], clone[4])

def detect_code_clones(duplication_data: Dict , neo4j_runner: Neo4jConnection) -> None:
    
    for file_path in list(duplication_data.keys()):
        if neo4j_runner.get_node(file_path):
                link_nodes(file_path, duplication_data[file_path]["clones"], neo4j_runner)
        else:
            continue

def format_payload(project_name: str, data: Dict) -> ExperimentResult:
    return {
        "projectName": project_name,
        "symfinderResult": {
            "vpJsonGraph": data,
            "statisticJson": ""
        },
        "externalMetrics": {}
    }
    

def send_data(db_data: Dict, project_name: str, endpoint: str) -> None:

    db_data_str = json.dumps(db_data)
    payload = format_payload(project_name, db_data_str)
    r = requests.post(endpoint, json=payload)

if __name__ == '__main__':
    task_id = sys.argv[1]
    detection_id = sys.argv[2]
    project_name = sys.argv[3]
    http = sys.argv[4]

    neo4j_runner = Neo4jConnection(URI, AUTH)

    clone_pairs_file = f"./msccd-interface/analysis_shared_files/tasks/task{task_id}/detection{detection_id}/pairs.file"
    file_list_file = f"./msccd-interface/analysis_shared_files/tasks/task{task_id}/fileList.txt"
    token_bags_list = f"./msccd-interface/analysis_shared_files//tasks/task{task_id}/tokenBags"

    dups_outfile = f"./msccd-interface/analysis_shared_files/duplications_data/{project_name}.json"
    db_outfile = f"./js/app/export/{project_name}.json"
    
    try:
        print("Preparing duplication data...")
        file_list: List = extract_file_list(file_list_file)
        bags_data: Dict = extract_bags_data(token_bags_list)
        duplication_data: Dict = export_clone_data(clone_pairs_file, file_list, project_name, bags_data)
    except Exception as e:
        print(f"something went wrong while preparing data, error: {e}")
    else:
        print("Data ready")
        write_file(duplication_data, dups_outfile)

    print("Requesting database")
    detect_code_clones(duplication_data, neo4j_runner)

    neo4j_runner.export_db()

    write_file(neo4j_runner.db_dict, db_outfile)

    print("Sending data...")
    send_data(neo4j_runner.db_dict, project_name, http)
    print("Data sent to Varicity, closing connection")
    neo4j_runner.close()