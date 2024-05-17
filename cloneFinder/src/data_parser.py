import json, os, sys
from typing import List, Dict, Tuple
import re
import requests

from .token_bag_parser import extract_bags_data, compute_clone_type, extract_bag
from .neo4j_connector import Neo4jConnection


TASK_FOLDER="../../tasks_volume/tasks"
CCD_FOLDER="../../tasks_volume/CCD_data"

class SymfinderResult:
    vp_json_graph: str = ""
    statistic_json: str = ""

class ExperimentResult:

    project_name: str
    symfinder_result: SymfinderResult

    def __init__(self, project_name: str) -> None:
        self.project_name = project_name
        self.symfinder_result = SymfinderResult()

class DataParser:

    def __init__(self, connector: Neo4jConnection) -> None:
        self.connector = connector

    def write_file(self, data: Dict, filepath: str):
        with open(filepath, "w") as outfile:
            json.dump(data, outfile, indent=4)

    def extract_file_list(self, filepath: str):
        with open(filepath, 'r') as f:
            tmp = f.readlines()
        file_list = []
        for line in tmp:
            split = line.split(',')
            file_list.append(split[1])
        return file_list

    def format_path(self, path: str, project_name) -> str:
        exp_pattern = rf".*/{project_name}/"
        exp_replacement = f"{project_name}/"

        return re.sub(exp_pattern, exp_replacement, path)

    def export_clone_data(self, clone_pairs_file: str, file_list: List, project_name: str, bags_data: Dict) -> Dict:
        clone_pairs = []
        for line in open(clone_pairs_file, "r").readlines():
            clone_pairs.append(json.loads(line[:-1]))
        res = dict()
        for line in clone_pairs:
            src_index = line[0][1]
            clone_index = line [1][1]

            if src_index != clone_index:
                src_path = file_list[src_index].strip("\n")
                clone_path = file_list[clone_index].strip("\n")

                src_bag_index = line[0][2]
                clone_bag_index = line[1][2]
                
                src_bag = extract_bag(bags_data, src_index, src_bag_index)
                clone_bag = extract_bag(bags_data, clone_index, clone_bag_index)

                src_path_f = self.format_path(src_path, project_name)
                clone_path_f = self.format_path(clone_path, project_name)
                
                if src_path_f not in res.keys():
                    src_name = self.get_file_name(src_path_f)
                    clone_name = self.get_file_name(clone_path_f)
                    if "test" in src_name or "test" in clone_name:
                        continue
                    clone_type = compute_clone_type(src_bag, clone_bag)
                    src_cloned_range = src_bag["line_range"]
                    clone_cloned_range = clone_bag["line_range"]
                    res[src_path_f] = {"name": src_name, "clones": [(clone_name, clone_path_f, clone_type, src_cloned_range, clone_cloned_range)]}
                else:
                    clone_name = self.get_file_name(clone_path_f)
                    if "test" in clone_name:
                        continue
                    clone_type = compute_clone_type(src_bag, clone_bag)
                    cloned_range = clone_bag["line_range"]
                    res[src_path_f]["clones"].append((clone_name, clone_path_f, clone_type, src_cloned_range, cloned_range))
            else:
                continue
        return res

    def get_file_name(self, path: str) -> str:
        splitted_path = path.split('/')
        return splitted_path[-1].strip("\n")
    
    def is_core_files(self, src_path: str, clone_path: str) -> bool:
        src_node = self.connector.get_node(src_path)
        try:
            src_labels = src_node[0][0].labels
        except Exception as e:
            print("file not find in db, labeled as not core")
            print(f"Error returned: {e}")
            return False
        if "CORE_FILE" in src_labels:
            clone_node = self.connector.get_node(clone_path)
            try:
                clone_labels = clone_node[0][0].labels
            except Exception as e:
                print("file not find in db, labeled as not core")
                print(f"Error returned: {e}")
                return False
            return "CORE_FILE" in clone_labels 
        else:
            return False

    def link_nodes(self, src_path: str, clones: List[Tuple]) -> None:
        for clone in clones:
            if self.is_core_files(src_path, clone[1]):
                self.connector.link_core(src_path, clone[1])
                self.connector.link_clones(src_path, clone[1], clone[2], clone[3], clone[4])
            else:
                self.connector.link_clones(src_path, clone[1], clone[2], clone[3], clone[4])

    def detect_code_clones(self, duplication_data: Dict) -> None:
        
        for file_path in list(duplication_data.keys()):
            if self.connector.get_node(file_path):
                    self.link_nodes(file_path, duplication_data[file_path]["clones"])
            else:
                continue

    def format_payload(self, project_name: str, data: Dict) -> ExperimentResult:
        return {
            "projectName": project_name,
            "symfinderResult": {
                "vpJsonGraph": data,
                "statisticJson": ""
            },
            "externalMetrics": {}
        }    

    def send_data(self, db_data: Dict, project_name: str, endpoint: str) -> None:

        db_data_str = json.dumps(db_data)
        payload = self.format_payload(project_name, db_data_str)
        r = requests.post(endpoint, json=payload)


if __name__ == '__main__':
    task_id = sys.argv[1]
    detection_id = sys.argv[2]
    project_name = sys.argv[3]

    clone_list_file = f"{TASK_FOLDER}/task{task_id}/detection{detection_id}/pairs.file"
    file_list_file = f"{TASK_FOLDER}/task{task_id}/fileList.txt"
    token_bags_list = f"{TASK_FOLDER}/task{task_id}/tokenBags"
    dups_outfile = f"{CCD_FOLDER}/{project_name}.json"

    URI = "bolt://localhost:7687"
    AUTH = ("neo4j", "root")

    parser = DataParser(Neo4jConnection(URI, AUTH))

    if os.path.exists(clone_list_file):
        file_list = parser.extract_file_list(file_list_file)
        bags_data = extract_bags_data(token_bags_list)
        clone_data = parser.export_clone_data(clone_list_file, file_list, project_name, bags_data)
        parser.write_file(clone_data, dups_outfile)