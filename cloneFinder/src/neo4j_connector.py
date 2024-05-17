from neo4j import GraphDatabase
from neo4j import Record
from typing import Dict, List



class Neo4jConnection:

    def __init__(self, uri, auth):
        self.driver = GraphDatabase.driver(uri, auth=auth)
        self.db_dict = {"links": [], "nodes": [], "alllinks": [], "allnodes": [], "linkscompose": []}

    def close(self):
        self.driver.close()
    
    @staticmethod
    def _get_node_with_path(tx, path: str) -> List:
        request = """
                MATCH (n:FILE)
                WHERE n.path = $path
                RETURN n
            """
        result = tx.run(request, path=path)
        return list(result)
    
    @staticmethod
    def _link_code_clones(tx, src_path: str, clone_path: str, clone_type: str, src_lines: str, target_lines: str) -> List:
        request = """
                MATCH (src:FILE {path: $src_path})
                MATCH (clone:FILE {path: $clone_path})
                MERGE (src)-[:CODE_CLONE {type: $clone_type, src_lines: $src_lines, target_lines: $target_lines}]->(clone)
               """
        result = tx.run(request, src_path=src_path, clone_path=clone_path, clone_type=clone_type, src_lines=src_lines, target_lines=target_lines)
        return list(result)
    
    @staticmethod
    def _link_core_files(tx, src_path: str, clone_path: str) -> List:
        request = """
                MATCH (src:FILE {path: $src_path})
                MATCH (clone:FILE {path: $clone_path})
                MERGE (src)-[:CORE_CONTENT]->(clone)
            """
        result = tx.run(request, src_path=src_path, clone_path=clone_path)
        return list(result)
    
    @staticmethod
    def _export_links(tx) -> List:
        request = """
            MATCH (n)-[r]->(m) 
            WHERE (type(r) = 'EXPORT' OR 
                   type(r) = 'IMPLEMENTS' OR 
                   type(r) = 'EXTENDS' OR 
                   type(r) = 'IMPORT' OR 
                   type(r) = 'LOAD' OR 
                   type(r) = 'CHILD')
            AND NOT ('OUT_OF_SCOPE' IN labels(m)) 
            AND NOT ('OUT_OF_SCOPE' IN labels(n)) 
            AND NOT ('VARIABLE' IN labels (m)) 
            AND NOT ('FUNCTION' IN labels(m))
            WITH CASE WHEN m.path IS NULL THEN m.name ELSE m.path END AS mname, CASE WHEN n.path IS NULL THEN n.name ELSE n.path END AS nname,r 
            WITH collect({source:nname,target:mname,type:type(r)}) AS rela 
            RETURN {links:rela}
            """
        result = tx.run(request)
        return list(result)
        
    @staticmethod
    def _export_dup_links(tx) -> List:
        request = """
            MATCH (n)-[r]->(m) 
            WHERE type(r) = 'CODE_CLONE'  OR 
                  type(r) = 'CORE_CONTENT' 
            AND NOT ('OUT_OF_SCOPE' IN labels(m)) 
            AND NOT ('OUT_OF_SCOPE' IN labels(n))
            WITH CASE WHEN m.path IS NULL THEN m.name ELSE m.path END AS mname, CASE WHEN n.path IS NULL THEN n.name ELSE n.path END AS nname,r
            WITH collect ({source:nname,target:mname,percentage: r.codePercent, clone: r.type, src_range: r.src_lines, trgt_range: r.target_lines, type:type(r)}) AS rela 
            RETURN {links:rela}
            """
        result = tx.run(request)
        return list(result)

    @staticmethod  
    def _export_all_links(tx) -> List:
        request = """
            MATCH (n)-[r]->(m) 
            WHERE (type(r) = 'EXPORT' OR 
                   type(r) = 'IMPLEMENTS' OR 
                   type(r) = 'EXTENDS' OR 
                   type(r) = 'IMPORT' OR 
                   type(r) = 'LOAD' OR 
                   type(r) = 'CHILD')
            AND NOT ('OUT_OF_SCOPE' IN labels(m)  OR 'FUNCTION' IN labels(m) OR 'VARIABLE' IN labels(m) OR 'PROPERTY' IN labels(m)) 
            AND NOT ('OUT_OF_SCOPE' IN labels(n) OR 'FUNCTION' IN labels(n) OR 'VARIABLE' IN labels(n) OR 'PROPERTY' IN labels(n)) 
            WITH CASE WHEN m.path IS NULL THEN m.name ELSE m.path END AS mname, CASE WHEN n.path IS NULL THEN n.name ELSE n.path END AS nname,r
            WITH collect ({source:nname,target:mname,type:type(r)}) AS rela
            RETURN {links:rela}
            """
        result = tx.run(request)
        return list(result)
    
    @staticmethod
    def _export_class(tx) -> List:
        request = """
            MATCH (n) 
            WHERE ('CLASS' IN labels(n) OR 'INTERFACE' IN labels(n)) and not ('BASE' IN labels(n))
            WITH collect({types:labels(n), name:n.name, constructorVPs:n.constructorVPs, publicConstructors:n.publicConstructors, methodVariants:n.methodVariants, classVariants:n.classVariants, publicMethods:n.publicMethods, methodVPs:n.methodVPs}) AS m 
            RETURN {nodes:m}
            """
        result = tx.run(request)
        return list(result)
        
    @staticmethod
    def _export_files(tx) -> List:
        request = """
            MATCH (n) 
            WHERE (n:VP_FOLDER OR n:VARIANT_FOLDER OR n:DIRECTORY OR n:VARIANT_FILE OR n:CORE_FILE OR n:FILE) AND NOT ('BASE' IN labels(n))
            WITH collect({types:labels(n), name:n.path, constructorVPs:n.constructorVPs, publicConstructors:n.publicConstructors, methodVariants:n.methodVariants, classVariants:n.classVariants, publicMethods:n.publicMethods, methodVPs:n.methodVPs}) as m 
            RETURN {nodes:m}
            """
        result = tx.run(request)
        return list(result)

    @staticmethod
    def _export_compose_links(tx) -> List:
        request = """
            MATCH (f:FILE)-[r]->(n)-[:TYPE_OF]->(m:CLASS)<-[:EXPORT]-(fe:FILE)
            WHERE ('PROPERTY' IN labels(n) OR 'PARAMETER' IN labels(n) OR 'VARIABLE' IN labels(n))
            WITH collect(distinct{source:f.path, target:fe.path, type:'USAGE'}) AS rela
            RETURN {linkscompose:rela}
            """
        result = tx.run(request)
        return list(result)
    
    def get_node(self, file_path: str) -> List:
        with self.driver.session(database="neo4j") as session:
            return session.execute_read(
                self._get_node_with_path,
                file_path
            )
        
    def link_clones(self, src_path: str, clone_path: str, clone_type, src_lines, target_lines) -> None:
        with self.driver.session(database="neo4j") as session:
            linked_nodes = session.execute_write(
                self._link_code_clones,
                src_path,
                clone_path,
                clone_type,
                src_lines,
                target_lines,
            )

    def link_core(self, src_path: str, clone_path: str) -> None:
        with self.driver.session(database="neo4j") as sesssion:
            core_link = sesssion.execute_write(
                self._link_core_files,
                src_path,
                clone_path
            )

    def export_db(self) -> None:
        with self.driver.session(database="neo4j") as session:
            links = session.execute_read(
                self._export_links
            )
            link_list = links[0][0]["links"]
            for elt in link_list:
                self.db_dict["links"].append(elt)

            dups_links = session.execute_read(
                self._export_dup_links
            )
            dups_list = dups_links[0][0]["links"]
            for elt in dups_list:
                self.db_dict["links"].append(elt)
                self.db_dict["alllinks"].append(elt)


            all_links = session.execute_read(
                self._export_all_links
            )
            all_list = all_links[0][0]["links"]
            for elt in all_list:
                self.db_dict["alllinks"].append(elt)

            compose_links = session.execute_read(
                self._export_compose_links
            )
            compose_list = compose_links[0][0]["linkscompose"]
            for elt in compose_list:
                self.db_dict["linkscompose"].append(elt)

            classes = session.execute_read(
                self._export_class
            )
            classes_list = classes[0][0]["nodes"]
            for elt in classes_list:
                self.db_dict["nodes"].append(elt)

            files = session.execute_read(
                self._export_files
            )
            files_list = files[0][0]["nodes"]
            for elt in files_list:
                self.db_dict["nodes"].append(elt)