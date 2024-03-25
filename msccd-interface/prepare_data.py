import json, os, sys
from typing import List, Dict
import re

from token_bag_parser import extract_bags_data, compute_clone_type, extract_bag


MSCCD_ROOT = "./analysis_shared_files/"

def write_file(data: Dict, filepath: str):
    with open(filepath, "w") as outfile:
        json.dump(data, outfile, indent=4)

def extract_file_list(filepath: str):
    with open(filepath, 'r') as f:
        tmp = f.readlines()
    file_list = []
    for line in tmp:
        split = line.split(',')
        file_list.append(split[1])
    return file_list

def format_path(path: str, project_name) -> str:
    exp_pattern = rf".*/{project_name}/"
    exp_replacement = f"experiments/{project_name}/"

    return  re.sub(exp_pattern, exp_replacement, path)

def export_clone_data(clone_pairs_file: str, file_list: List, project_name: str, bags_data: Dict) -> Dict:
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

            src_path_f = format_path(src_path, project_name)
            clone_path_f = format_path(clone_path, project_name)
            
            if src_path_f not in res.keys():
                src_name = get_file_name(src_path_f)
                clone_name = get_file_name(clone_path_f)
                if "test" in src_name or "test" in clone_name:
                    continue
                
                clone_type = compute_clone_type(src_bag, clone_bag)
                src_cloned_range = src_bag["line_range"]
                clone_cloned_range = clone_bag["line_range"]
                res[src_path_f] = {"name": src_name, "clones": [(clone_name, clone_path_f, clone_type, src_cloned_range, clone_cloned_range)]}
            else:
                clone_name = get_file_name(clone_path_f)
                if "test" in clone_name:
                    continue
                clone_type = compute_clone_type(src_bag, clone_bag)
                cloned_range = clone_bag["line_range"]
                res[src_path_f]["clones"].append((clone_name, clone_path_f, clone_type, src_cloned_range, clone_cloned_range))
        else:
            continue
    return res

def get_file_name(path: str) -> str:
    splitted_path = path.split('/')
    return splitted_path[-1].strip("\n")

if __name__ == '__main__':
    task_id = sys.argv[1]
    detection_id = sys.argv[2]
    project_name = sys.argv[3]

    clone_list_file = f"{MSCCD_ROOT}/tasks/task{task_id}/detection{detection_id}/pairs.file"
    file_list_file = f"{MSCCD_ROOT}/tasks/task{task_id}/fileList.txt"
    token_bags_list = f"{MSCCD_ROOT}/tasks/task{task_id}/tokenBags"
    dups_outfile = f"./analysis_shared_files/duplications_data/{project_name}.json"


    if os.path.exists(clone_list_file):
        file_list = extract_file_list(file_list_file)
        bags_data = extract_bags_data(token_bags_list)
        clone_data = export_clone_data(clone_list_file, file_list, project_name, bags_data)
        write_file(clone_data, dups_outfile)