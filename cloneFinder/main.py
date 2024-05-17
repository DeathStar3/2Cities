
import sys
from typing import List, Tuple, Dict

from src.config_accessor import getAdress, getAuth
from src.data_parser import DataParser
from src.neo4j_connector import Neo4jConnection
from src.token_bag_parser import extract_bags_data


# URI = "bolt://localhost:7687"
# AUTH = ("neo4j", "root")


# Double return as the path are open is DataParser which is in src so there are two levels to go back
TASK_FOLDER="../tasks_volume/tasks"
CCD_FOLDER="../tasks_volume/CCD_data"

if __name__ == '__main__':
    task_id = sys.argv[1]
    detection_id = sys.argv[2]
    project_name = sys.argv[3]
    http = sys.argv[4]

    URI = getAdress()
    AUTH = getAuth()
    neo4j_runner = Neo4jConnection(URI, AUTH)

    data_parser = DataParser(neo4j_runner)

    clone_pairs_file = f"{TASK_FOLDER}/task{task_id}/detection{detection_id}/pairs.file"
    file_list_file = f"{TASK_FOLDER}/task{task_id}/fileList.txt"
    token_bags_list = f"{TASK_FOLDER}/task{task_id}/tokenBags"

    dups_outfile = f"{CCD_FOLDER}/{project_name}.json"
    # db_outfile = f"./js/app/export/{project_name}.json"
    
    try:
        print("Preparing duplication data...")
        file_list: List = data_parser.extract_file_list(file_list_file)
        bags_data: Dict = extract_bags_data(token_bags_list)
        duplication_data: Dict = data_parser.export_clone_data(clone_pairs_file, file_list, project_name, bags_data)
    except Exception as e:
        print(f"something went wrong while preparing data, error: {e}")
    else:
        print("Data ready")
        data_parser.write_file(duplication_data, dups_outfile)

    print("Requesting database")
    data_parser.detect_code_clones(duplication_data)

    neo4j_runner.export_db()

    # data_parser.write_file(neo4j_runner.db_dict, db_outfile)

    print("Sending data...")
    data_parser.send_data(neo4j_runner.db_dict, project_name, http)
    print("Data sent to Varicity, closing connection")
    neo4j_runner.close()