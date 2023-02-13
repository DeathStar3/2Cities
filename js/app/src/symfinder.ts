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
import ClassesVisitor from "./visitors/ClassesVisitor"
import SymfinderVisitor from "./visitors/SymfinderVisitor";
import GraphBuilderVisitor from "./visitors/GraphBuilderVisitor";
import StrategyTemplateDecoratorVisitor from "./visitors/StrategyTemplateDecoratorVisitor"
import Parser from "./parser/Parser";
import NeoGraph from "./neograph/NeoGraph";
import {config} from "./configuration/Configuration";
import {join} from "path";
import {readdirSync, readFileSync, statSync} from "fs";
import {EntityAttribut, EntityType, RelationType} from "./neograph/NodeType";
import {Node} from "neo4j-driver-core";
import {detectClones} from "jscpd";
import {ExperimentResult} from "./neograph/entities/experiment.model";
import axios from "axios";
import path = require("path");


export class Symfinder{

    neoGraph: NeoGraph;

    constructor(){
        this.neoGraph = new NeoGraph(config);
    }

    /**
     * run symfinder for the specific project
     * @param src path to the root directory
     * @param http_path
     */
    async run(src: string, http_path: string){
        await this.neoGraph.clearNodes();

        console.log("Analyse variability in : '" + src + "'")

        let files: string[] = await this.visitAllFiles(src);
        process.stdout.write("\rDetecting files ("+files.length+"): done.\x1b[K\n");
        await this.visitPackage(files, new ClassesVisitor(this.neoGraph), "classes");
        await this.visitPackage(files, new GraphBuilderVisitor(this.neoGraph), "relations");
        await this.visitPackage(files, new StrategyTemplateDecoratorVisitor(this.neoGraph), "strategies");

        await this.neoGraph.detectVPsAndVariants();
        await this.proximityFolderDetection();
        await this.detectCommonEntityProximity();
        await this.detectCommonMethodImplemented();

        await this.neoGraph.exportToJSON();
        let content = await this.neoGraph.exportRelationJSON();
        if(http_path !== "") {
            await this.sendToServer(src, http_path, content);
            console.log("Sent to server " + http_path)
        }
        console.log("db fetched");

        console.log("Number of VPs: " + await this.neoGraph.getTotalNbVPs());
        console.log("Number of methods VPs: " + await this.neoGraph.getNbMethodVPs());
        console.log("Number of constructor VPs: " + await this.neoGraph.getNbConstructorVPs());
        console.log("Number of method level VPs: " + await this.neoGraph.getNbMethodLevelVPs());
        console.log("Number of class level VPs: " + await this.neoGraph.getNbClassLevelVPs());
        console.log("Number of variants: " + await this.neoGraph.getTotalNbVariants());
        console.log("Number of methods variants: " + await this.neoGraph.getNbMethodVariants());
        console.log("Number of constructors variants: " + await this.neoGraph.getNbConstructorVariants());
        console.log("Number of method level variants: " + await this.neoGraph.getNbMethodLevelVariants());
        console.log("Number of class level variants: " + await this.neoGraph.getNbClassLevelVariants());
        console.log("Number of variant files: " + await this.neoGraph.getNbVariantFiles());
        console.log("Number of variant folder: " + await this.neoGraph.getNbVariantFolders());
        console.log("Number of vp folder: " + await this.neoGraph.getNbVPFolders());
        console.log("Number of proximity entities: " + await this.neoGraph.getNbProximityEntity());
        console.log("Number of nodes: " + await this.neoGraph.getNbNodes());
        console.log("Number of relationships: " + await this.neoGraph.getNbRelationships());



        await this.neoGraph.driver.close();


    }

    /**
     * Visit all source code files with the given visitor (visitor pattern)
     * @param files to visit
     * @param visitor class wich contain analysis
     * @param label logger label
     */
    async visitPackage(files: string[], visitor: SymfinderVisitor, label: string){
        var nbFiles = files.length;
        var currentFile = 0;
        for(let file of files){
            let parser = new Parser(file);
            await parser.accept(visitor);
            currentFile++;
            process.stdout.write("\rResolving "+label+": " + ((100 * currentFile) / nbFiles).toFixed(0) + "% (" + currentFile + "/" + nbFiles + ")");
        }
        process.stdout.write("\rResolving "+label+": " + ((100 * currentFile) / nbFiles).toFixed(0) + "% (" + currentFile + "/" + nbFiles + ")" + ", done.\n");
    }

    /**
     * Visit all files of the selected project and annoted them in the neo4j graph
     * @param path to the root directory
     * @returns source code files to analyse
     */
    async visitAllFiles(path: string): Promise<string[]>{
        var folderName = path.split('/').pop();
        if(folderName === undefined) return [];
        await this.neoGraph.createNodeWithPath(folderName, path, EntityType.DIRECTORY, []);
        return await this.visitFiles(path, []);
    }

    /**
     * Visit file recursively at the specific path
     * @param path to the current directory which is visited
     * @param files all files already visited
     * @returns all files visited
     */
    async visitFiles(path: string, files: string[]): Promise<string[]>{

        var parentFolderName = path.split('/').slice(-1)[0];
        if(parentFolderName === undefined) return files;
        var parentNode = await this.neoGraph.getNodeWithPath(parentFolderName, path);
        if(parentNode === undefined) return files;

        for(let fileName of readdirSync(path)){
            const absolute_path = join(path, fileName);
            if (statSync(absolute_path).isDirectory()){
                if(!fileName.includes('test') && !fileName.includes('Test')){
                    var folderNode: Node = await this.neoGraph.createNodeWithPath(fileName, absolute_path, EntityType.DIRECTORY, []);
                    await this.neoGraph.linkTwoNodes(<Node>parentNode, folderNode, RelationType.CHILD);
                    var newFiles = await this.visitFiles(absolute_path, files);
                    files.concat(newFiles);
                }else{
                    process.stdout.write("\rFolder '"+fileName+"' exclude...                                                            \n");
                }
            }
            else{
                //filter typescript files
                if(fileName.endsWith(".ts") && !fileName.endsWith(".test.ts") && !fileName.endsWith("Test.ts") && !fileName.endsWith(".spec.ts") && !fileName.endsWith(".d.ts")){
                    process.stdout.write("\rDetecting files ("+files.length+"): '"+fileName + "'\x1b[K");
                    files.push(absolute_path);
                    var fileNode = await this.neoGraph.createNodeWithPath(fileName, absolute_path, EntityType.FILE, []);
                    await this.neoGraph.linkTwoNodes(<Node>parentNode, fileNode, RelationType.CHILD)
                }
            }
        }
        return files;
    }

    /**
     * Detect folder with the proximity analyse describe in scientific TER article
     * This method annoted folder and files with :
     * VP_FOLDER
     * VARIANT_FOLDER
     * VARIANT_FILE
     * SUPER_VARIANT_FILE
     */
    async proximityFolderDetection(): Promise<void>{

        await this.neoGraph.setProximityFolder();
        var vpFoldersPath: string[] = await this.neoGraph.getAllVPFoldersPath();

        let i = 0;
        let len = vpFoldersPath.length;
        for(let vpFolderPath of vpFoldersPath){
            i++;
            process.stdout.write("\rSearch SUPER variant files: "+ (((i) / len) * 100).toFixed(0) +"% ("+i+"/"+len+")");
            var variantFilesNameSet: string[] = await this.neoGraph.getVariantFilesNameForVPFolderPath(vpFolderPath);
            var foldersPath: string[] = await this.neoGraph.getFoldersPathForVPFolderPath(vpFolderPath);

            var isSuperVariantFile = true;
            for(let variantFileName of variantFilesNameSet){

                var superVariantFilesNode: Node[] = [];
                for(let folderPath of foldersPath){

                    let currentFile: Node | undefined = await this.neoGraph.getVariantFileForFolderPath(folderPath, variantFileName);
                    if(currentFile === undefined){
                        isSuperVariantFile = false;
                        break;
                    }
                    else superVariantFilesNode.push(currentFile)
                }
                if(isSuperVariantFile){
                    for(let superVariantFileNode of superVariantFilesNode){
                        await this.neoGraph.addLabelToNode(superVariantFileNode, EntityAttribut.CORE_FILE)
                    }
                }
            }
            await this.detectCodeDuplication(vpFolderPath);
        }
        if(i > 0)
            process.stdout.write("\rSearch SUPER variant files: "+ (((i) / len) * 100).toFixed(0) +"% ("+i+"/"+len+"), done.\n");
        await this.detectCodeClone();
    }

    /**
     * Detect clones beetween all VARIANT_FILE of a VP_FOLDER
     */
    async detectCodeClone(): Promise<void>{
        var nodes: Node[] = await this.neoGraph.getAllVariantFiles();
        var groupedNode: any[] = [];
        for(let node of nodes){
            if(groupedNode[node.properties.name] === undefined){
                groupedNode[node.properties.name] = [node]
            }
            else{
                groupedNode[node.properties.name].push(node)
            }
        }
        let i = 0;
        let len = Object.entries(groupedNode).length
        for(let [key, value] of Object.entries(groupedNode)){
            i++;
            process.stdout.write("\rCheck duplication code: "+ (((i) / len) * 100).toFixed(0) +"% ("+i+"/"+len+")");

            var clones: any[] = await detectClones({
                path: value.map((node: Node) => node.properties.path),
                silent: true
            })
            for(let clone of clones){
              var nodeA: any = nodes.find((node: Node) => {
                const abs_path = path.resolve(node.properties.path)
                return abs_path == clone.duplicationA.sourceId
              });
              var nodeB: any = nodes.find((node: Node) => {
                const abs_path = path.resolve(node.properties.path)
                return abs_path == clone.duplicationB.sourceId
              });

                if(nodeA === undefined || nodeB === undefined){
                    continue;
                }

                var percentA = (((clone.duplicationA.range[1] - clone.duplicationA.range[0]) / readFileSync(nodeA.properties.path, 'utf-8').length) * 100).toFixed(0);
                var percentB = (((clone.duplicationB.range[1] - clone.duplicationB.range[0]) / readFileSync(nodeB.properties.path, 'utf-8').length) * 100).toFixed(0);
                await this.neoGraph.linkTwoNodesWithCodeDuplicated(nodeA, nodeB, RelationType.CORE_CONTENT,
                    clone.duplicationA.fragment, percentA, clone.duplicationA.start.line + ":" + clone.duplicationA.end.line);
                await this.neoGraph.linkTwoNodesWithCodeDuplicated(nodeB, nodeA, RelationType.CORE_CONTENT,
                    clone.duplicationA.fragment, percentB, clone.duplicationB.start.line + ":" + clone.duplicationB.end.line);
            }
        }
        if(i > 0)
            process.stdout.write("\rCheck duplication code: "+ (((i) / len) * 100).toFixed(0) +"% ("+i+"/"+len+"), done.\n");
    }

    async detectCodeDuplication(folderPath: string): Promise<void> {
        var nodes: Node[] = await this.neoGraph.getAllFiles();
        var clones: any[] = await detectClones({
            path: [folderPath],
            silent: true
        })
        for (let clone of clones){
            var nodeA: any = nodes.find((node: Node) => {
              const abs_path = path.resolve(node.properties.path)
              return abs_path == clone.duplicationA.sourceId
            });
            var nodeB: any = nodes.find((node: Node) => {
              const abs_path = path.resolve(node.properties.path)
              return abs_path == clone.duplicationB.sourceId
            });

            if(nodeA === undefined || nodeB === undefined){
                continue;
            }
            var percentA = (((clone.duplicationA.range[1] - clone.duplicationA.range[0]) / readFileSync(nodeA.properties.path, 'utf-8').length) * 100).toFixed(0);
            var percentB = (((clone.duplicationB.range[1] - clone.duplicationB.range[0]) / readFileSync(nodeB.properties.path, 'utf-8').length) * 100).toFixed(0);
            await this.neoGraph.linkTwoNodesWithCodeDuplicated(nodeA, nodeB, RelationType.CODE_DUPLICATED,
                clone.duplicationA.fragment, percentA, clone.duplicationA.start.line +":"+ clone.duplicationA.end.line);
            await this.neoGraph.linkTwoNodesWithCodeDuplicated(nodeB, nodeA, RelationType.CODE_DUPLICATED,
                clone.duplicationA.fragment, percentB, clone.duplicationB.start.line +":"+ clone.duplicationB.end.line);
        }
    }

    /**
     * Detect common entities between all VARIANT_FILE of a VP_FOLDER
     * @returns
     */
    async detectCommonEntityProximity(): Promise<void>{

        var vpFoldersPath: string[] = await this.neoGraph.getAllVPFoldersPath();

        let i = 0;
        let len = vpFoldersPath.length;
        for(let vpFolderPath of vpFoldersPath){
            i++;
            process.stdout.write("\rDetect common entities: "+ (((i) / len) * 100).toFixed(0) +"% ("+i+"/"+len+")");
            var variantFilesNameSet: string[] = await this.neoGraph.getVariantFilesNameForVPFolderPath(vpFolderPath);

            for(let variantFileName of variantFilesNameSet){

                var variantFileNodes: Node[] = await this.neoGraph.getVariantFilesForVPFolderPath(vpFolderPath, variantFileName);
                var entitiesOcc: any[] = [];

                for(let variantFileNode of variantFileNodes){

                    for(let entityNode of await this.neoGraph.getVariantEntityNodeForFileNode(variantFileNode)){
                        let pname :any = entityNode.properties.name + '_reserved';
                        if(entitiesOcc[pname] === undefined){
                            entitiesOcc[pname] = [entityNode];
                        }
                        else{
                            entitiesOcc[pname].push(entityNode);
                        }
                    }
                }

                for(let [key, value] of Object.entries(entitiesOcc)){
                    if(value.length > 1 && value.length == variantFileNodes.length){
                        for(let entityNode of value){
                            await this.neoGraph.addLabelToNode(entityNode, EntityAttribut.PROXIMITY_ENTITY);
                        }
                    }
                }
            }
        }
        if(i > 0)
            process.stdout.write("\rDetect common entities: "+ (((i) / len) * 100).toFixed(0) +"% ("+i+"/"+len+"), done.\n");

        return;
    }

    /**
     * Detect common methods between all VARIANT_FILE of a VP_FOLDER
     * @returns
     */
    async detectCommonMethodImplemented(): Promise<void>{

        var motherEntitiesNode: Node[] = await this.neoGraph.getMotherEntitiesNode();
        let i = 0;
        let len = motherEntitiesNode.length;

        for(let motherEntityNode of motherEntitiesNode){
            i++;
            process.stdout.write("\rDetect common method: "+ (((i) / len) * 100).toFixed(0) +"% ("+i+"/"+len+")");

            var implementedClasses: Node[] = await this.neoGraph.getImplementedClassesFromEntity(motherEntityNode);
            var occurenceMethod: any = {};
            var motherMethod: string[] = (await this.neoGraph.getMethods(motherEntityNode)).map((n) => n.properties.name);
            for(let implemetedClass of implementedClasses){

                var implementedClassMethods = await this.neoGraph.getMethods(implemetedClass);
                for(let implementedClassMethod of implementedClassMethods){
                    let pname :any = implementedClassMethod.properties.name + '_reserved';
                    if(occurenceMethod[pname] === undefined){
                        occurenceMethod[pname] = [implementedClassMethod];
                    }
                    else{
                        occurenceMethod[pname].push(implementedClassMethod);
                    }
                }
            }
            for(let [key, value] of Object.entries(occurenceMethod)){

                let methods = <Node[]> value;
                if(methods.length > 1 && methods.length == implementedClasses.length && !motherMethod.includes(key)){
                    for(let method of methods){
                        await this.neoGraph.addLabelToNode(method, EntityAttribut.COMMON_METHOD);
                    }
                }
            }

        }
        if(i > 0)
            process.stdout.write("\rDetect common method: "+ (((i) / len) * 100).toFixed(0) +"% ("+i+"/"+len+"), done.\n");

        return;
    }

    private createProjectJson(src: string, content: string): ExperimentResult {
        let paths = src.split('/');
        return {
            projectName: paths[paths.length - 1],
            symfinderResult: {
                vpJsonGraph: content,
                statisticJson: ""
            },
            externalMetric: new Map()
        };
    }

    private async sendToServer(src: string, http_path: string, content: string) {
        console.log("CREATE PROJECT JSON : ");
        const result = this.createProjectJson(src, content);
        console.log("\n################Sending request ...\n")
        await axios.post(http_path, result).catch((reason: any) => console.log(reason))
                                                    .then(() => console.log("Data has been correctly sent"))
    }
}
