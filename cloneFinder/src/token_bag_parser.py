import json
from typing import Dict
import sys

def extract_bags_data(filepath: str):
    with open(filepath, "r") as infile:
        tmp = infile.readlines()

    bags_data = {}
    for line in tmp:
        split = line.split('@ @')
        file_index = split[1]
        if file_index in bags_data.keys():
            bag_number = split[2]
            bag = {"nb_tokens": split[6], "line_range": split[7], "content": split[8]}
            bags_data[file_index][bag_number] = bag
        else:
            bag_number = split[2]
            bag = {"nb_tokens": split[6], "line_range": split[7], "content": split[8]}
            bags_data[file_index] = {bag_number: bag}

    return bags_data

def compute_clone_type(src_bag: Dict, clone_bag: Dict) -> int:
    src_bag_content = src_bag["content"]
    clone_bag_content = clone_bag["content"]

    if src_bag_content == clone_bag_content:
        return 1
    else: 
        return 3

def extract_bag(bags_data: Dict, file_index: int, bag_index: int) -> Dict:
    file_data = bags_data[str(file_index)]
    return file_data[str(bag_index)]
