import json
from typing import List, Tuple, Dict
import sys

from neo4j_connector import Neo4jConnection
from prepare_data import extract_file_list, export_clone_data, write_file


# URI examples: "neo4j://localhost", "neo4j+s://xxx.databases.neo4j.io"
URI = "bolt://localhost:7687"
AUTH = ("neo4j", "root")


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

if __name__ == '__main__':
    task_id = sys.argv[1]
    detection_id = sys.argv[2]
    outfile = sys.argv[3]

    neo4j_runner = Neo4jConnection(URI, AUTH)

    clone_pairs_file = f"./analysis_shared_files/tasks/task{task_id}/detection{detection_id}/pairs.file"
    file_list_file = f"./analysis_shared_files/tasks/task{task_id}/fileList.txt"
    
    try:
        print("Preparing duplication data...")
        file_list: List = extract_file_list(file_list_file)
        duplication_data: Dict = export_clone_data(clone_pairs_file, file_list)
    except Exception as e:
        print(f"something went wrong while preparing data, error: {e}")
    else:
        print("Data ready")
        write_file(duplication_data, outfile)

    print("Requesting database")
    detect_code_clones(duplication_data, neo4j_runner)