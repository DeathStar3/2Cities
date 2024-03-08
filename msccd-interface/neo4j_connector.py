from neo4j import GraphDatabase
from neo4j.graph import Node
from typing import List
import json

from db_types import RelationTypes


class Neo4jConnection:

    def __init__(self, uri, auth):
        self.driver = GraphDatabase.driver(uri, auth=auth)

    def close(self):
        self.driver.close()
    
    @staticmethod
    def _get_node_with_path(tx, path: str):
        request = """
                MATCH (n:FILE)
                WHERE n.path = $path
                RETURN n
            """
        result = tx.run(request, path=path)
        return list(result)
    
    @staticmethod
    def _link_code_clones(tx, src_path: str, clone_path: str) -> None:
        request = """
                MATCH (src:FILE {path: $src_path})
                MATCH (clone:FILE {path: $clone_path})
                MERGE (src)-[:CODE_CLONE]->(clone)
               """
        result = tx.run(request, src_path=src_path, clone_path=clone_path)
        return list(result)
    
    def get_node(self, file_path: str) -> List:
        with self.driver.session(database="neo4j") as session:
            return session.execute_read(
                self._get_node_with_path,
                file_path
            )
        
    def link_clones(self, src_path: str, clone_path: str) -> List:
        with self.driver.session(database="neo4j") as session:
            linked_nodes = session.execute_write(
                self._link_code_clones,
                src_path,
                clone_path
            )