import json
import requests
import sys
from typing import List, Tuple, Dict


from neo4j_connector import Neo4jConnection
from prepare_data import extract_file_list, export_clone_data, write_file

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

def link_nodes(src_path: str, clones: List[Tuple], neo4j_runner: Neo4jConnection) -> None:
    for clone in clones:
        neo4j_runner.link_clones(src_path, clone[1])
        neo4j_runner.link_clones(clone[1], src_path)


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
    print(r.reason)
    print(r.content)
    print(r.raise_for_status)

if __name__ == '__main__':
    task_id = sys.argv[1]
    detection_id = sys.argv[2]
    project_name = sys.argv[3]
    http = sys.argv[4]

    neo4j_runner = Neo4jConnection(URI, AUTH)

    clone_pairs_file = f"./analysis_shared_files/tasks/task{task_id}/detection{detection_id}/pairs.file"
    file_list_file = f"./analysis_shared_files/tasks/task{task_id}/fileList.txt"

    dups_outfile = f"./analysis_shared_files/duplications_data/{project_name}.json"
    db_outfile = f"../js/app/export/{project_name}.json"
    
    try:
        print("Preparing duplication data...")
        file_list: List = extract_file_list(file_list_file)
        duplication_data: Dict = export_clone_data(clone_pairs_file, file_list)
    except Exception as e:
        print(f"something went wrong while preparing data, error: {e}")
    else:
        print("Data ready")
        write_file(duplication_data, dups_outfile)

    print("Requesting database")
    detect_code_clones(duplication_data, neo4j_runner)

    neo4j_runner.export_db()

    write_file(neo4j_runner.db_dict, db_outfile)

    send_data(neo4j_runner.db_dict, project_name, http)

    neo4j_runner.close()