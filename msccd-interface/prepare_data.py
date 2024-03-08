import json, os, sys
from typing import List, Dict


MSCCD_ROOT = "./"

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

def export_clone_data(clone_pairs_file: str, file_list: List) -> Dict:
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
            
            if src_path not in res.keys():
                src_name = get_file_name(src_path)
                clone_name = get_file_name(clone_path)
                if "test" in src_name or "test" in clone_name:
                    continue
                res[src_path] = {"name": src_name, "clones": [(clone_name, clone_path)]}
            else:
                clone_name = get_file_name(clone_path)
                if "test" in clone_name:
                    continue
                res[src_path]["clones"].append((clone_name, clone_path))
        else:
            continue
    return res

def get_file_name(path: str) -> str:
    splitted_path = path.split('/')
    return splitted_path[-1].strip("\n")

if __name__ == '__main__':
    task_id = sys.argv[1]
    detection_id = sys.argv[2]
    outfile = sys.argv[3]

    clone_list_file = f"{MSCCD_ROOT}/tasks/task{task_id}/detection{detection_id}/pairs.file"
    file_list_file = f"{MSCCD_ROOT}/tasks/task{task_id}/fileList.txt"

    if os.path.exists(clone_list_file):
        file_list = extract_file_list(file_list_file)
        clone_data = export_clone_data(clone_list_file, file_list)
        write_file(clone_data, outfile)