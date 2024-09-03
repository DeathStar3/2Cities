/*
 * This file is part of symfinder.
 *
 * symfinder is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * symfinder is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with symfinder. If not, see <http://www.gnu.org/licenses/>.
 *
 * Copyright 2021-2022 Bruel Martin <martin.bruel999@gmail.com>
 */
import {writeFile} from "fs";
import {driver, Driver} from "neo4j-driver";
import {auth, Node, QueryResult, Record, Session, Transaction} from "neo4j-driver-core";
import {exit} from "process";
import {Configuration} from "../configuration/Configuration"
import {DesignPatternType, EntityAttribut, EntityType, NodeType, RelationType} from "./NodeType";
import {stringify} from "querystring";

export default class NeoGraph{

    driver: Driver;

    constructor(config: Configuration){
        this.driver = driver(config.getNeo4JBoltAdress(), auth.basic('neo4j', 'root'),{ disableLosslessIntegers: true });
    }

    async createNode(name: string, type: NodeType, types: NodeType[]): Promise<Node> {
        types.push(type);
        const request = "CREATE (n:"+types.join(':')+" { name: $name}) RETURN (n)";
        return this.submitRequest(request, {name: name}).then((result: Record[]) =>{
            return <Node>(result[0].get(0));
        });
    }

    async createNodeWithPath(name: string, path:string, type: NodeType, types: NodeType[]): Promise<Node> {
        types.push(type);
        const request = "CREATE (n:"+types.join(':')+" { name:$name, path:$path }) RETURN (n)";
        return this.submitRequest(request, {name: name, path:path}).then((result: Record[]) =>{
            return <Node>(result[0].get(0));
        });
    }

    async changeInternalLinkToExport(name: string, path: string) {
        const request = "MATCH (n {name: $name})<-[i:INTERNAL]-(f:FILE {path: $path}) WITH n,i,f ORDER BY id(n) DESC LIMIT 1 CREATE (n)<-[:EXPORT]-(f) DELETE i";
        //on prend celui avec le plus grand Id car il se peut qu'un fichier a plusieurs class/interface avec le même nom mais seulement la dernière est exportée
        await this.submitRequest(request, {name: name, path: path});
    }

    async getOrCreateNode(name: string, type: EntityType, createAttributes: EntityAttribut[], matchAttributes: EntityAttribut[]): Promise<Node>{
        const onCreateAttributes = createAttributes.length == 0 ? "" : "ON CREATE SET n:" + createAttributes.join(':');
        const onMatchAttributes = matchAttributes.length == 0 ? "" : "ON MATCH SET n:" + matchAttributes.join(":");
        const request = "MERGE (n:"+type+" {name: $name}) "+onCreateAttributes+" "+onMatchAttributes+" RETURN (n)";

        return this.submitRequest(request, {name:name}).then((result: Record[]) =>{
            return <Node>(result[0].get(0));
        });
    }

    async getOrCreateNodeWithPath(name: string, path: string, type: EntityType, createAttributes: EntityAttribut[], matchAttributes: EntityAttribut[]): Promise<Node>{
        const onCreateAttributes = createAttributes.length == 0 ? "" : "ON CREATE SET n:" + createAttributes.join(':');
        const onMatchAttributes = matchAttributes.length == 0 ? "" : "ON MATCH SET n:" + matchAttributes.join(":");
        const request = "MERGE (n:"+type+" {name: $name, path: $path}) "+onCreateAttributes+" "+onMatchAttributes+" RETURN (n)";

        return this.submitRequest(request, {name:name, path:path}).then((result: Record[]) =>{
            return <Node>(result[0].get(0));
        });
    }

    async getNode(name: string): Promise<Node | undefined>{
        const request = "MATCH (n {name: $name}) RETURN (n)";

        return this.submitRequest(request, {name:name}).then((result: Record[]) =>{
            return result[0] ? <Node>(result[0].get(0)) : undefined;
        });
    }

    async getAllNodes(path: string, relationship: RelationType): Promise<Node[]>{
        const request = "MATCH (:FILE {path: $path})-[:"+relationship+"]->(n) RETURN (n)";

        return this.submitRequest(request, {path: path}).then((result: Record[]) =>{
            return result.map(value => value.get(0));
        });
    }

    /*async getNodeWithClass(name: string, className: string): Promise<Node | undefined>{
        const request = "MATCH (n {name: $name})<--(m:CLASS {name: $className}) RETURN (n)";

        return this.submitRequest(request, {name:name, className:className}).then((result: Record[]) =>{
            return result[0] ? <Node>(result[0].get(0)) : undefined;
        });
    }*/

    async getNodeWithFile(name: string, path: string): Promise<Node | undefined>{
        const request = "MATCH (n)<-[r]-(m {path: $path}) WHERE n.name = $name or r.alt_name = $name RETURN (n)";

        return this.submitRequest(request, {name:name, path:path}).then((result: Record[]) =>{
            return result[0] ? <Node>(result[0].get(0)) : undefined;
        });
    }

    async getElementNodeWithFile(name: string, type:EntityType,path: string): Promise<Node | undefined>{
        const request = "MATCH (n:"+type+")<--(m {path: $path}) WHERE n.name = $name OR n.alt_name = $name RETURN (n)";

        return this.submitRequest(request, {name:name, path:path}).then((result: Record[]) =>{
            return result[0] ? <Node>(result[0].get(0)) : undefined;
        });
    }

    async getClassNodeWithPath(className: string, path: string): Promise<Node | undefined>{
        const request = "MATCH (n {name: $name})<-[:EXPORT|INTERNAL]-(m {path: $path}) RETURN (n)";

        return this.submitRequest(request, {name:className, path:path}).then((result: Record[]) =>{
            return result[0] ? <Node>(result[0].get(0)) : undefined;
        });
    }

    async getClassNodeByModuleIfUnique(className: string, moduleName: string): Promise<Node | undefined>{
        const request = "MATCH (m:MODULE {name: $moduleName}) WITH m.path AS Mpath MATCH (n {name: $className}) <-[:EXPORT|INTERNAL]-(o {path: Mpath}) RETURN (n)";

        return this.submitRequest(request, {className:className, moduleName:moduleName}).then((result: Record[]) =>{
            return result.length === 1 ? <Node>(result[0].get(0)) : undefined;
        });
    }

    async getClassNodeByModule(className: string, moduleName: string, path: string): Promise<Node | undefined>{
        const request = "MATCH (:MODULE {name: $moduleName, path: $path})<-[:EXPORT|INTERNAL]-(:FILE)-[:EXPORT|INTERNAL]->(n {name: $className}) WHERE NOT n:MODULE RETURN (n)";

        return this.submitRequest(request, {className:className, moduleName:moduleName, path:path}).then((result: Record[]) =>{
            return result.length === 1 ? <Node>(result[0].get(0)) : undefined;
        });
    }

    async getNodeWithPath(name: string, path: string): Promise<Node | undefined>{
        const request = "MATCH (n {name:$name, path:$path}) RETURN (n)";

        return this.submitRequest(request, {name:name, path:path}).then((result: Record[]) =>{
            return result[0] ? <Node>(result[0].get(0)) : undefined;
        });
    }

    async getNodeWithType(name: string, type: EntityType): Promise<Node | undefined>{
        const request = "MATCH (n:"+type+" {name: $name}) RETURN (n)";

        return this.submitRequest(request, {name:name}).then((result: Record[]) =>{
            return result[0] ? <Node>(result[0].get(0)) : undefined;
        });
    }

    async getClassNodeWithImport(className: string, filePath: string): Promise<Node | undefined> {
        const request = "MATCH (:FILE {path: $path})-[:IMPORT]->(n {name: $name})<-[:EXPORT]-(:FILE) RETURN n";
        return this.submitRequest(request, {name: className, path: filePath}).then((result: Record[]) =>{
            return result[0] ? <Node>(result[0].get(0)) : undefined;
        });
    }

    async getClassNodeIfUnique(className: string): Promise<Node | undefined> {
        const request = "MATCH (n {name: $name})<-[:EXPORT|INTERNAL]-(f) RETURN (n)";
        return this.submitRequest(request, {name: className}).then((result: Record[]) =>{
            return result.length == 1 ? <Node>(result[0].get(0)) : undefined;
        });
    }

    async getNodeByClass(name: string, filePath: string) {
        const request = "MATCH (n {name: $name})<--(:CLASS)<--(:FILE {path: $path}) RETURN (n)";
        return this.submitRequest(request, {name: name, path: filePath}).then((result: Record[]) =>{
            return result.length == 1 ? <Node>(result[0].get(0)) : undefined;
        });
    }

    async linkTwoNodes(node1: Node, node2: Node, type: RelationType): Promise<void> {
        const request = "MATCH(a)\n" +
        "WHERE ID(a)=$aId\n" +
        "WITH a\n" +
        "MATCH (b)\n" +
        "WITH a,b\n" +
        "WHERE ID(b)=$bId\n" +
        "MERGE (a)-[r:"+type+"]->(b)";
        await this.submitRequest(request, {aId: node1.identity, bId: node2.identity});
    }

    async linkTwoNodesWithCodeDuplicated(node1: Node, node2: Node, type: RelationType, percent: string, lines: string): Promise<void> {
        const request = "MATCH(a)\n" +
        "WHERE ID(a)=$aId\n" +
        "WITH a\n" +
        "MATCH (b)\n" +
        "WITH a,b\n" +
        "WHERE ID(b)=$bId\n" +
        "CREATE (a)-[r:"+type+" {codePercent: $percent, lines: $lines}]->(b)";
        await this.submitRequest(request, {aId: node1.identity, bId: node2.identity, percent:percent, lines: lines});
    }

    async updateLinkTwoNode(node1: Node, node2: Node, oldType: RelationType, newType: RelationType): Promise<void> {
        const request = "MATCH(a)\n" +
        "WHERE ID(a)=$aId\n" +
        "WITH a\n" +
        "MATCH (b)\n" +
        "WITH a,b\n" +
        "WHERE ID(b)=$bId\n" +
        "MATCH(a)-[r1:"+oldType+"]->(b)\n" +
        "DELETE r1\n" +
        "CREATE (a)-[r2:"+newType+"]->(b)";

        await this.submitRequest(request, {aId: node1.identity, bId: node2.identity});
    }

    async setAlternativeName(fileNode: Node, node: Node, name: string): Promise<Node | undefined>{
        const request = "MATCH (f)-[e:EXPORT]->(n)\n" +
        "WHERE ID(f) = $fileId and ID(n) = $id\n" +
        "SET e.alt_name = $name\n" +
        "RETURN n";

        return await this.submitRequest(request, {fileId: fileNode.identity, id: node.identity, name: name}).then((result: Record[]) =>{
            return result[0] ? <Node>(result[0].get(0)) : undefined;
        });
    }

    async getNbVariant(node: Node): Promise<number>{
        const request = "MATCH (c)-[:EXTENDS|IMPLEMENTS]->(c2:CLASS) " +
        "WHERE ID(c) = $id " +
        "RETURN count(c2)";

        return this.submitRequest(request, {id:node.identity}).then((result: Record[]) =>{
            return +(result[0].get(0));
        })
    }

    async addLabelToNode(node: Node, label: string): Promise<void>{
        const request = "MATCH (n) WHERE ID(n) = $id SET n:"+label+" RETURN (n)"
        return this.submitRequest(request, {id:node.identity}).then((result: Record[]) =>{
            return;
        })
    }

    async detectVPsAndVariants(): Promise<void>{
        await this.setMethodVPs();
        await this.setMethodVariants();
        await this.setConstructorVPs();
        await this.setConstructorVariants();
        await this.setNbVariantsProperty();
        await this.setVPLabels();
        await this.setMethodLevelVPLabels();
        await this.setVariantsLabels();
        await this.setPublicMethods();
        await this.setPublicConstructors();
        await this.setNbCompositions();
        await this.setAllMethods();
        await this.detectStrategiesWithComposition();
        await this.detectDensity();
        //await this.setModuleVP();
        //await this.setModuleVariant();
    }

    async setMethodVPs(): Promise<void>{
        await this.submitRequest("MATCH (c:CLASS)-->(a:METHOD) MATCH (c:CLASS)-->(b:METHOD)\n" +
        "WHERE a.name = b.name AND ID(a) <> ID(b)\n" +
        "WITH count(DISTINCT a.name) AS cnt, c\n" +
        "SET c.methodVPs = cnt", {});

        await this.submitRequest("MATCH (c:CLASS)\n" +
        "WHERE NOT EXISTS(c.methodVPs)\n" +
        "SET c.methodVPs = 0",{});
    }

    async setMethodVariants(): Promise<void>{
        await this.submitRequest("MATCH (c:CLASS)-->(a:METHOD) MATCH (c:CLASS)-->(b:METHOD)\n" +
        "WHERE a.name = b.name AND ID(a) <> ID(b)\n" +
        "WITH count(DISTINCT a) AS cnt, c\n" +
        "SET c.methodVariants = cnt - 1",{});
        await this.submitRequest("MATCH (c:CLASS)\n" +
        "WHERE NOT EXISTS(c.methodVariants)\n" +
        "SET c.methodVariants = 0",{});
    }

    async setConstructorVPs(): Promise<void>{
        await this.submitRequest("MATCH (c:CLASS)-->(a:CONSTRUCTOR)\n" +
        "WITH count(a.name) AS cnt, c\n" +
        "SET c.constructorVPs = CASE WHEN cnt > 1 THEN 1 ELSE 0 END",{});
        await this.submitRequest("MATCH (c:CLASS)\n" +
        "WHERE NOT EXISTS(c.constructorVPs)\n" +
        "SET c.constructorVPs = 0",{});
    }

    async setConstructorVariants(): Promise<void>{
        await this.submitRequest("MATCH (c:CLASS)-->(a:CONSTRUCTOR)\n" +
        "WITH count(a.name) AS cnt, c\n" +
        "SET c.constructorVariants = CASE WHEN cnt > 1 THEN cnt ELSE 0 END",{});
        await this.submitRequest("MATCH (c:CLASS)\n" +
        "WHERE NOT EXISTS(c.constructorVariants)\n" +
        "SET c.constructorVariants = 0",{});
    }

    async setNbVariantsProperty(): Promise<void>{
        await this.submitRequest("MATCH (c)-[:EXTENDS|IMPLEMENTS]->(sc:CLASS) WITH count(sc) AS nbVar, c SET c.classVariants = nbVar",{});
        await this.submitRequest("MATCH (c) WHERE ((c:CLASS OR c:INTERFACE) AND NOT EXISTS (c.classVariants)) SET c.classVariants = 0",{});
    }

    async setVPLabels(): Promise<void>{
        const clauseForHavingDesignPattern = Object.keys(DesignPatternType).map((nodeType) => "c:" + nodeType).join(" OR ");
        const request = "MATCH (c) WHERE (NOT c:OUT_OF_SCOPE)\n"
        +"AND (c:INTERFACE OR (c:CLASS AND c:ABSTRACT) OR ("+clauseForHavingDesignPattern+") OR (EXISTS(c.classVariants) AND c.classVariants > 0))\n"
        +"SET c:"+EntityAttribut.VP;
        await this.submitRequest(request,{});
    }

    async setMethodLevelVPLabels(): Promise<void>{
        const request = "MATCH (c) WHERE (NOT c:OUT_OF_SCOPE) AND (c.methodVPs > 0 OR c.constructorVPs > 0) SET c:" + EntityAttribut.METHOD_LEVEL_VP;
        await this.submitRequest(request, {});
    }

    async setVariantsLabels(): Promise<void>{
        const request = "MATCH (sc:VP)-[:EXTENDS|IMPLEMENTS]->(c) WHERE c:CLASS OR c:INTERFACE SET c:" + EntityAttribut.VARIANT;
        await this.submitRequest(request, {});
    }

    async setPublicMethods(): Promise<void>{
        await this.submitRequest("MATCH (c:CLASS:PUBLIC)-->(a:METHOD:PUBLIC)\n" +
        "WITH count( a.name ) AS cnt, c\n" +
        "SET c.publicMethods = cnt",{});
        await this.submitRequest("MATCH (c:CLASS)\n" +
        "WHERE NOT EXISTS(c.publicMethods)\n" +
        "SET c.publicMethods = 0",{});
    }

    async setPublicConstructors(): Promise<void> {
        await this.submitRequest("MATCH (c)-->(a) \n" +
        "WHERE c:PUBLIC AND c:CLASS AND  a:CONSTRUCTOR AND a:PUBLIC\n" +
        "WITH count( a.name ) AS cnt, c\n" +
        "SET c.publicConstructors = cnt",{});
        await this.submitRequest("MATCH (c:CLASS)\n" +
        "WHERE NOT EXISTS(c.publicConstructors)\n" +
        "SET c.publicConstructors = 0",{});
    }

    async setNbCompositions(): Promise<void>{
        await this.submitRequest("MATCH (c)-[:INSTANTIATE]->(a) WITH count(a) AS nbComp, c SET c.nbCompositions = nbComp",{});
    }

    async setAllMethods(): Promise<void>{
        await this.submitRequest("MATCH (c:CLASS)-->(a:METHOD)\n" +
        "WITH count( a.name ) AS cnt, c\n" +
        "SET c.allMethods = cnt", {});
        await this.submitRequest("MATCH (c:CLASS)\n" +
        "WHERE NOT EXISTS(c.allMethods)\n" +
        "SET c.allMethods = 0", {});
    }

    // async setModuleVP(): Promise<void>{
    //     const request = "MATCH (c1:CLASS) MATCH (c2:CLASS)\n"+
    //     "WHERE c1.name = c2.name\n" +
    //     "AND ID(c1)<>ID(c2)\n" +
    //     "SET c1:"+EntityAttribut.MODULE_VP+"\n" +
    //     "SET c2:"+EntityAttribut.MODULE_VP;
    //     await this.submitRequest(request,{});
    // }

    // async setModuleVariant(): Promise<void>{
    //     const request = "MATCH (m:MODULE)-[:EXPORT]->(c:MODULE_VP) SET m:"+EntityAttribut.MODULE_VARIANT;
    //     await this.submitRequest(request, {});
    // }

    async setProximityFolder(): Promise<void>{
        const request = "MATCH (n:DIRECTORY)-[:CHILD]->(d1:DIRECTORY)-[:CHILD]->(f1:FILE), (n:DIRECTORY)-[:CHILD]->(d2:DIRECTORY)-[:CHILD]->(f2:FILE)\n"+
        "WHERE ID(f1)<>ID(f2)\n"+
        "AND ID(d1)<>ID(d2)\n"+
        "AND f1.name = f2.name\n"+
        "AND f1.name <> $index\n"+
        "AND f1.name <> $utils\n"+
        "AND f1.name <> $types\n"+
        "SET n:"+EntityAttribut.VP_FOLDER+"\n"+
        "SET d1:"+EntityAttribut.VARIANT_FOLDER+"\n"+
        "SET f1:"+EntityAttribut.VARIANT_FILE+"\n";
        await this.submitRequest(request, {index:"index.ts",utils:"utils.ts",types:'types.ts'});
    }

    async detectStrategiesWithComposition(): Promise<void>{
        const request = "MATCH (c)-[:INSTANTIATE]->(c1) " +
        "WHERE (c:CLASS OR c:INTERFACE) AND (EXISTS(c1.classVariants) AND c1.classVariants > 1) " +
        "SET c1:" + DesignPatternType.COMPOSITION_STRATEGY;
        await this.submitRequest(request, {});
    }

    async detectDensity(): Promise<void>{
        await this.submitRequest("MATCH (v1:VARIANT)-[:INSTANTIATE]->(v2:VARIANT) " +
        "SET v1:DENSE SET v2:DENSE", {});
    }

    async getTotalNbVPs(): Promise<number>{
        return (await this.getNbClassLevelVPs()) + (await this.getNbMethodLevelVPs());
    }

    async getNbClassLevelVPs(): Promise<number>{
        return this.submitRequest("MATCH (c:VP) RETURN COUNT (DISTINCT c)", {}).then((result: Record[]) =>{
            return +(result[0].get(0));
        });
    }

    async getNbMethodLevelVPs(): Promise<number>{
        return await this.getNbMethodVPs() + await this.getNbConstructorVPs();
    }

    async getNbMethodVPs() : Promise<number>{
        return this.submitRequest("MATCH (c:CLASS) RETURN (SUM(c.methodVPs))", {}).then((result: Record[]) =>{
            return +(result[0].get(0));
        });
    }

    async getNbConstructorVPs() : Promise<number>{
        return this.submitRequest("MATCH (c:CLASS) RETURN (SUM(c.constructorVPs))", {}).then((result: Record[]) =>{
            return +(result[0].get(0));
        });
    }

    async getTotalNbVariants(): Promise<number>{
        return await this.getNbClassLevelVariants() + await this.getNbMethodLevelVariants();
    }

    async getNbClassLevelVariants(): Promise<number>{
        return this.submitRequest("MATCH (c:VARIANT) WHERE NOT c:VP RETURN (COUNT(DISTINCT c))", {}).then((result: Record[]) =>{
            return +(result[0].get(0));
        });
    }

    async getNbMethodLevelVariants(): Promise<number>{
        return await this.getNbMethodVariants() + await this.getNbConstructorVariants();
    }

    async getNbMethodVariants(): Promise<number>{
        return this.submitRequest("MATCH (c:CLASS) RETURN (SUM(c.methodVariants))", {}).then((result: Record[]) =>{
            return +(result[0].get(0));
        });
    }

    async getNbConstructorVariants(): Promise<number>{
        return this.submitRequest("MATCH (c:CLASS) RETURN (SUM(c.constructorVariants))", {}).then((result: Record[]) =>{
            return +(result[0].get(0));
        });
    }

    async getNbNodes(): Promise<number>{
        return this.submitRequest("MATCH(n) RETURN count(*)", {}).then((result: Record[]) =>{
            return +(result[0].get(0));
        });
    }

    async getNbRelationships(): Promise<number>{
        return this.submitRequest("MATCH (n)-[r]->() RETURN COUNT(r)", {}).then((result: Record[]) =>{
            return +(result[0].get(0));
        });
    }

    async getNbVPFolders(): Promise<number>{
        return this.submitRequest("MATCH (d:VP_FOLDER) RETURN (COUNT(DISTINCT d))", {}).then((result: Record[]) =>{
            return +(result[0].get(0));
        })
    }

    async getNbVariantFolders(): Promise<number>{
        return this.submitRequest("MATCH (d:VARIANT_FOLDER) RETURN (COUNT(DISTINCT d))", {}).then((result: Record[]) =>{
            return +(result[0].get(0));
        })
    }

    async getNbVariantFiles(): Promise<number>{
        return this.submitRequest("MATCH (d:VARIANT_FILE) RETURN (COUNT(DISTINCT d))", {}).then((result: Record[]) =>{
            return +(result[0].get(0));
        })
    }

    async getNbCoreFiles(): Promise<number>{
        return this.submitRequest("MATCH (d:CORE_FILE) RETURN (COUNT(DISTINCT d))", {}).then((result: Record[]) =>{
            return +(result[0].get(0));
        })
    }

    async  getNbProximityEntity(): Promise<number>{
        return this.submitRequest("MATCH (d:PROXIMITY_ENTITY) RETURN (COUNT(DISTINCT d))", {}).then((result: Record[]) =>{
            return +(result[0].get(0));
        })
    }

    async getAllVariantFiles(): Promise<Node[]>{
        return this.submitRequest("MATCH (n:"+EntityAttribut.VARIANT_FILE+") RETURN n", {}).then((results: Record[]) =>{
            return <Node[]> (results.map((result: Record) => result.get(0)));
        });
    }

    async getAllFiles(): Promise<Node[]> {
        return this.submitRequest("MATCH (n:"+EntityType.FILE+") RETURN n", {}).then((results: Record[]) =>{
            return <Node[]> (results.map((result: Record) => result.get(0)));
        });
    }

    async getAllClass(): Promise<Node[]> {
        return this.submitRequest("MATCH (n:"+EntityType.CLASS+") RETURN n", {}).then((results: Record[]) =>{
            return <Node[]> (results.map((result: Record) => result.get(0)));
        });
    }

    async getNbExportRelationships(): Promise<number>{
        return this.submitRequest("MATCH (n)-[r:EXPORT]->() RETURN COUNT(r)", {}).then((result: Record[]) =>{
            return +(result[0].get(0));
        });
    }

    async getAllVPFoldersPath(): Promise<string[]>{
        return this.submitRequest("MATCH (n:"+EntityAttribut.VP_FOLDER+") RETURN n.path", {}).then((results: Record[]) =>{
            return <string[]> (results.map((result: Record) => result.get(0)));
        });
    }

    async getFoldersPathForVPFolderPath(vpFolderPath: string): Promise<string[]>{
        return this.submitRequest("MATCH (n:"+EntityAttribut.VP_FOLDER+")-[:"+RelationType.CHILD+"]->(d:"+EntityType.DIRECTORY+")\n"+
        "WHERE n.path = $path RETURN d.path", {path:vpFolderPath}).then((results: Record[]) =>{
            return <string[]> (results.map((result: Record) => result.get(0)));
        });
    }

    async getVariantFilesNameForVPFolderPath(vpFolderPath: string): Promise<string[]>{
        return this.submitRequest("MATCH (n:"+EntityAttribut.VP_FOLDER+")-[:"+RelationType.CHILD+"]->(d:"+EntityAttribut.VARIANT_FOLDER+")-[:"+RelationType.CHILD+"]->(f:"+EntityAttribut.VARIANT_FILE+")\n" +
        "WHERE n.path = $path\n" +
        "RETURN DISTINCT f.name", {path:vpFolderPath}).then((results: Record[]) =>{
            return <string[]> (results.map((result: Record) => result.get(0)));
        });
    }

    async getVariantFilesForVPFolderPath(vpFolderPath: string, variantFileName: string): Promise<Node[]>{
        return this.submitRequest("MATCH (n:"+EntityAttribut.VP_FOLDER+")-[:"+RelationType.CHILD+"]->(d:"+EntityAttribut.VARIANT_FOLDER+")-[:"+RelationType.CHILD+"]->(f:"+EntityAttribut.VARIANT_FILE+")\n" +
        "WHERE n.path = $path\n" +
        "AND f.name = $name\n" +
        "RETURN f", {path:vpFolderPath, name:variantFileName}).then((results: Record[]) =>{
            return <Node[]> (results.map((result: Record) => result.get(0)));
        });
    }

    async getVariantFileForFolderPath(folderPath: string, variantFileName: string): Promise<Node | undefined>{
        return this.submitRequest("MATCH (d:"+EntityType.DIRECTORY+")-[:"+RelationType.CHILD+"]->(f:"+EntityAttribut.VARIANT_FILE+")\n"+
        "WHERE d.path = $folderPath AND f.name = $variantFileName RETURN f", {folderPath:folderPath, variantFileName:variantFileName})
        .then((results: Record[]) =>{
            return results[0] ? <Node>(results[0].get(0)) : undefined;
        });
    }

    async getVariantEntityNodeForFileNode(fileNode: Node): Promise<Node[]>{
        const request = "MATCH (f:"+EntityType.FILE+")-[]->(e)\n" +
        "WHERE (e:"+EntityType.CLASS+" or e:"+EntityType.FUNCTION+" or e:"+EntityType.VARIABLE+")\n" +
        "AND ID(f) = $id\n" +
        "RETURN e";

        return this.submitRequest(request, {id:fileNode.identity}).then((results: Record[]) =>{
            return <Node[]> (results.map((result: Record) => result.get(0)));
        });
    }

    async getMotherEntitiesNode(): Promise<Node[]>{
        const request = "MATCH (e)-[r:"+RelationType.EXTENDS+"|"+RelationType.IMPLEMENTS+"]->(c:CLASS)\n"+
        "WHERE e:"+EntityType.CLASS+" or e:"+EntityType.INTERFACE+"\n" +
        "RETURN DISTINCT e";

        return this.submitRequest(request, {}).then((results: Record[]) =>{
            return <Node[]> (results.map((result: Record) => result.get(0)));
        });
    }

    async getImplementedClassesFromEntity(entity: Node): Promise<Node[]>{
        const request = "MATCH (n)-[r:"+RelationType.EXTENDS+"|"+RelationType.IMPLEMENTS+"]->(c) WHERE ID(n) = $id RETURN c";

        return this.submitRequest(request, {id:entity.identity}).then((results: Record[]) =>{
            return <Node[]> (results.map((result: Record) => result.get(0)));
        });
    }

    async getMethods(entity: Node){
        const request = "MATCH (e)-[r:"+RelationType.METHOD+"]->(m:"+EntityType.METHOD+") WHERE ID(e) = $id RETURN m";

        return this.submitRequest(request, {id:entity.identity}).then((results: Record[]) =>{
            return <Node[]> (results.map((result: Record) => result.get(0)));
        });
    }

    async exportToJSON(): Promise<String[]> {
        const request = "MATCH (n) WHERE n:VP_FOLDER OR n:VARIANT_FOLDER OR n:DIRECTORY OR n:VARIANT_FILE OR n:CORE_FILE OR n:FILE RETURN collect({types:labels(n), name:n.name})";

        return this.submitRequest(request, {}).then(function(results: Record[]){
            const data = results.map((result: Record) => result.get(0));
            let content = JSON.stringify(data);
            writeFile('./export/db.json', content,(err: any) => {
                if (err) throw err;
                process.stdout.write('data written to file');
            });
            return <string[]> data;
        });
    }

    async exportRelationJSON(src:string):Promise<string> {
        const requestLinks = "match (n)-[r]->(m) where (type(r) = 'EXPORT' or type(r) = 'IMPLEMENTS' or type(r) = 'EXTENDS'" +
            " or type(r) = 'IMPORT' or type(r) = 'LOAD' or type(r) = 'CHILD'  or type(r) = 'CORE_CONTENT' or type(r) = 'CODE_CLONE')" +
            " and not ('OUT_OF_SCOPE' in labels(m)) and not ('OUT_OF_SCOPE' in labels(n)) and not ('VARIABLE' in labels (m)) and not ('FUNCTION' in labels(m))" +
            "with CASE when m.path IS NULL then m.name else m.path end as mname, CASE " +
            "when n.path IS NULL then n.name else n.path end as nname,r with collect " +
            "({source:nname,target:mname,type:type(r)}) as rela return {links:rela}";
        const duplicationLinksRequest = "match (n)-[r]->(m) where type(r) = 'CODE_CLONE'  or type(r) = 'CORE_CONTENT' and not ('OUT_OF_SCOPE' in labels(m)) and not ('OUT_OF_SCOPE' in labels(n)) " +
            "with CASE when m.path IS NULL then m.name else m.path end as mname, CASE when n.path IS NULL then n.name else n.path end as nname,r " +
            " with collect ({source:nname,target:mname,percentage: r.codePercent, type:type(r)}) as rela return {links:rela} ";
        const classRequest = "MATCH (n) where ('CLASS' in labels(n) or 'INTERFACE' in labels(n)) and not ('BASE' in labels(n)) " +
            "with collect({types:labels(n), name:n.name, constructorVPs:n.constructorVPs," +
            "publicConstructors:n.publicConstructors, methodVariants:n.methodVariants, classVariants:n.classVariants," +
            "publicMethods:n.publicMethods, methodVPs:n.methodVPs}) as m return {nodes:m}";
        const fileRequest = "MATCH (n) WHERE (n:VP_FOLDER OR n:VARIANT_FOLDER OR n:DIRECTORY OR n:VARIANT_FILE OR n:CORE_FILE OR n:FILE) " +
            "and not ('BASE' in labels(n)) with " +
            "collect({types:labels(n), name:n.path, constructorVPs:n.constructorVPs," +
            "publicConstructors:n.publicConstructors, methodVariants:n.methodVariants, classVariants:n.classVariants," +
            "publicMethods:n.publicMethods, methodVPs:n.methodVPs}) as m return {nodes:m}";
        const linksComposeRequest = "MATCH (f:FILE) -[r]-> (n)-[:TYPE_OF]->(m:CLASS)<-[:EXPORT]-(fe:FILE) " +
            "WHERE 'PROPERTY' in labels(n) or 'PARAMETER' in labels(n) or 'VARIABLE' in labels(n) " +
            "WITH collect ( distinct {source:f.path,target:fe.path,type:'USAGE'}) as rela " +
            "RETURN {linkscompose:rela} ";
        const allLinks = "match (n)-[r]->(m) where (type(r) = 'EXPORT' or type(r) = 'IMPLEMENTS' or type(r) = 'EXTENDS'" +
            " or type(r) = 'IMPORT' or type(r) = 'LOAD' or type(r) = 'CHILD'  or type(r) = 'CORE_CONTENT' or type(r) = 'CODE_CLONE')" +
            " and not ('OUT_OF_SCOPE' in labels(m)  or 'FUNCTION' in labels(m) or 'VARIABLE' in labels(m) or 'PROPERTY' in labels(m)) and not ('OUT_OF_SCOPE' in labels(n) or 'FUNCTION' in labels(n) " +
            "or 'VARIABLE' in labels(n) or 'PROPERTY' in labels(n)) with CASE when m.path IS NULL then m.name else m.path end as mname, CASE " +
            "when n.path IS NULL then n.name else n.path end as nname,r with collect " +
            "({source:nname,target:mname,type:type(r)}) as rela return {links:rela}";

        function replaceLinkPrefix(link: any) {
            if (link.source.startsWith('..')) {
                link.source = './' + link.source.split('/').slice(2).join('/');
            }
            if (link.target.startsWith('..')) {
                link.target = './' + link.target.split('/').slice(2).join('/');
            }
        }

        let data = {links: [], nodes: [], alllinks: [], allnodes: [], linkscompose: []};
        await this.submitRequest(duplicationLinksRequest, {}).then(function (results: Record[]) {
            data.links = results.map((result: Record) => result.get(0))[0].links;
        });
        await this.submitRequest(requestLinks, {}).then(function (results: Record[]) {
            data.links.push.apply(data.links, results.map((result: Record) => result.get(0))[0].links);
        });
        data.links.map((link: any) => {
            if (link.source.startsWith('..')) {
                link.source = './' + link.source.split('/').slice(2).join('/');
            }
            if (link.target.startsWith('..')) {
                link.target = './' + link.target.split('/').slice(2).join('/');
            }
        });
        await this.submitRequest(fileRequest, {}).then(function (results: Record[]) {
            data.nodes = results.map((result: Record) => result.get(0))[0].nodes;
        });
        data.nodes.map((node: any) => {
            if (node.name.startsWith('..')) {
                node.name = './' + node.name.split('/').slice(2).join('/');
            }
        })
        await this.submitRequest(classRequest, {}).then(function (results: Record[]) {
            data.nodes.push.apply(data.nodes, results.map((result: Record) => result.get(0))[0].nodes);
        });
        await this.submitRequest(linksComposeRequest, {}).then(function (results: Record[]) {
            data.linkscompose = results.map((result: Record) => result.get(0))[0].linkscompose;
        });
        data.linkscompose.map((linkscompose: any) => {
            if (linkscompose.source.startsWith('..')) {
                linkscompose.source = './' + linkscompose.source.split('/').slice(2).join('/');
            }
            if (linkscompose.target.startsWith('..')) {
                linkscompose.target = './' + linkscompose.target.split('/').slice(2).join('/');
            }
        });

        await this.submitRequest(allLinks, {}).then(function (results: Record[]) {
            data.alllinks = results.map((result: Record) => result.get(0))[0].links;
        });
        data.alllinks.push.apply(data.alllinks, data.linkscompose);
        data.links.map((link: any) => {
            replaceLinkPrefix(link);
        });
        data.alllinks.map((link: any) => {
            replaceLinkPrefix(link);
        });

        let content = JSON.stringify(data);
        let projectName =src.split("/").pop();
        writeFile('./export/'+projectName+'.json', content,(err: any) => {
            if (err) throw err;
            process.stdout.write('data written to file');
        });
        return content;
    }

    async clearNodes(): Promise<void>{
        const request = "MATCH (n) WHERE NOT (n:BASE) DETACH DELETE n"
        await this.submitRequest(request, {});
    }

    async markNodesAsBase(): Promise<void>{
        const request = "MATCH (n) SET n:BASE"
        await this.submitRequest(request, {});
    }

    async submitRequest(request: string, parameter: any): Promise<Record[]>{
        var maxTry = 10;
        var waitingTime = 5;
        for(let nbTry = 0; nbTry < maxTry; nbTry++){
            try {
                var session: Session = this.driver.session();
                var transaction: Transaction = session.beginTransaction();
                var result: QueryResult = await transaction.run(request, parameter);
                await transaction.commit();
                if(nbTry > 0) process.stdout.write("\rDatabase ready.                                               \n");
                return result.records;
            } catch (Error) {
                process.stdout.write("\rData base not ready... Retrying in "+waitingTime+" sec (" + nbTry + "/" + maxTry + ")");
                console.log(Error)
                await new Promise<void>((res) => setTimeout(()=>res(), waitingTime * 1000));
            }
        }
        process.stdout.write("\rData base not ready... Retrying in "+waitingTime+" sec (" + maxTry + "/" + maxTry + ")" + "\n");
        console.log("Cannot connect to the database...");
        exit(1);
    }
}
