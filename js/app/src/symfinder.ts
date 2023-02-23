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
import {
    CompilerOptions,
    createCompilerHost,
    createProgram,
    ModuleKind,
    Program,
    ScriptTarget
} from "typescript";
import UsageVisitor from "./visitors/UsageVisitor";
import {FileStats} from "./utils/file_stats";
import ExportVisitor from "./visitors/ExportVisitor";

export class Symfinder{

    neoGraph: NeoGraph;

    constructor(){
        this.neoGraph = new NeoGraph(config);
    }

    /**
     * run symfinder for the specific project
     * @param src path to the root directory
     * @param http_path
     * @param analysis_base if it's an analysis of a base library
     * @param stats_file create or not a file with some statistics
     */
    async run(src: string, http_path: string, analysis_base: boolean, stats_file: boolean){
        await this.neoGraph.clearNodes();

        console.log("Analyse variability in : '" + src + "'")
        const timeStart = Date.now();

        let files: string[] = await this.visitAllFiles(src);
        process.stdout.write("\rDetecting files ("+files.length+"): done.\x1b[K\n");

        const options: CompilerOptions = { strict: true, target: ScriptTarget.Latest, allowJs: true, module: ModuleKind.ES2015 }
        let program = createProgram(files, options, createCompilerHost(options, true));

        await this.visitPackage(files, new ClassesVisitor(this.neoGraph, analysis_base), "classes", program, true);
        const usageVisitor = new UsageVisitor(this.neoGraph, program);
        const exportVisitor = new ExportVisitor(this.neoGraph, program);
        if(!analysis_base) {
            await this.visitPackage(files, exportVisitor, "export", program, true);
            await this.visitPackage(files, new GraphBuilderVisitor(this.neoGraph), "relations", program, true);
            await this.visitPackage(files, new StrategyTemplateDecoratorVisitor(this.neoGraph), "strategies", program, true);
            await this.visitPackage(files, usageVisitor, "usages", program, false); // See issue #33 "Wrong objectFlags value in async"

            await this.neoGraph.detectVPsAndVariants();
            await this.proximityFolderDetection();
            await this.detectCommonEntityProximity();
            await this.detectCommonMethodImplemented();
        } else {
            await this.neoGraph.markNodesAsBase();
        }

        const timeEnd = Date.now();

        await this.neoGraph.exportToJSON();
        let content = await this.neoGraph.exportRelationJSON();
        if(http_path !== "") {
            await this.sendToServer(src, http_path, content);
            console.log("Sent to server " + http_path)
        }
        console.log("db fetched");

        let stats = new FileStats();
        stats.files_count = files.length;
        stats.variants_count = await this.neoGraph.getTotalNbVariants();
        stats.relationships_count = await this.neoGraph.getNbRelationships();
        stats.nodes_count = await this.neoGraph.getNbNodes();
        stats.unknown_paths_count = usageVisitor.getUnknownPaths().size;
        stats.unknown_export_sources = exportVisitor.getUnknownSourcesCount();
        console.log("Number of VPs: " + await this.neoGraph.getTotalNbVPs());
        console.log("Number of methods VPs: " + await this.neoGraph.getNbMethodVPs());
        console.log("Number of constructor VPs: " + await this.neoGraph.getNbConstructorVPs());
        console.log("Number of method level VPs: " + await this.neoGraph.getNbMethodLevelVPs());
        console.log("Number of class level VPs: " + await this.neoGraph.getNbClassLevelVPs());
        console.log("Number of variants: " + stats.variants_count);
        console.log("Number of methods variants: " + await this.neoGraph.getNbMethodVariants());
        console.log("Number of constructors variants: " + await this.neoGraph.getNbConstructorVariants());
        console.log("Number of method level variants: " + await this.neoGraph.getNbMethodLevelVariants());
        console.log("Number of class level variants: " + await this.neoGraph.getNbClassLevelVariants());
        console.log("Number of variant files: " + await this.neoGraph.getNbVariantFiles());
        console.log("Number of variant folder: " + await this.neoGraph.getNbVariantFolders());
        console.log("Number of vp folder: " + await this.neoGraph.getNbVPFolders());
        console.log("Number of proximity entities: " + await this.neoGraph.getNbProximityEntity());
        console.log("Number of nodes: " + stats.nodes_count);
        console.log("Number of relationships: " + stats.relationships_count);
        console.log("Duration: "+this.msToTime(timeEnd-timeStart));
        if(!analysis_base) {
            const classes = await this.neoGraph.getAllClass();
            console.log("Number of unknown class path: " + ((stats.unknown_paths_count / (classes.length+stats.unknown_paths_count)) * 100).toFixed(2) + "% (" + stats.unknown_paths_count + "/" + classes.length + ")");

            const exportsCount = await this.neoGraph.getNbExportRelationships();
            console.log("Number of unknown export source: " + ((stats.unknown_export_sources / (stats.unknown_export_sources + exportsCount)) * 100).toFixed(2) + "% (" + stats.unknown_export_sources + "/" + exportsCount + ")");
        }
        if(stats_file)
            stats.write();

        await this.neoGraph.driver.close();


    }

    msToTime(duration: number) {
        let milliseconds: number = Math.floor((duration % 1000) / 100),
            seconds:any = Math.floor((duration / 1000) % 60),
            minutes:any = Math.floor((duration / (1000 * 60)) % 60),
            hours:any = Math.floor((duration / (1000 * 60 * 60)) % 24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
    }

    /**
     * Visit all source code files with the given visitor (visitor pattern)
     * @param files to visit
     * @param visitor class wich contain analysis
     * @param label logger label
     * @param program the program
     * @param async determines if the function executes the analyses in async or sync
     */
    async visitPackage(files: string[], visitor: SymfinderVisitor, label: string, program: Program, async: boolean){
        const nbFiles = files.length;
        let currentFile = 0;
        const analyse = [];
        for(let file of files){
            let parser = new Parser(file, program);
            if(async) {
                analyse.push(parser.accept(visitor).then(_ => {
                    currentFile++;
                    process.stdout.write("\rResolving " + label + ": " + ((100 * currentFile) / nbFiles).toFixed(0) + "% (" + currentFile + "/" + nbFiles + ")");
                }));
            } else {
                await parser.accept(visitor);
                currentFile++;
                process.stdout.write("\rResolving " + label + ": " + ((100 * currentFile) / nbFiles).toFixed(0) + "% (" + currentFile + "/" + nbFiles + ")");
            }
        }
        if(async)
            await Promise.all(analyse);
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
                if(fileName.endsWith(".ts") && !fileName.endsWith(".usage.ts") && !fileName.endsWith("Test.ts") && !fileName.endsWith("test.ts") && !fileName.endsWith("tests.ts") && !fileName.endsWith(".spec.ts") && !fileName.endsWith(".d.ts")){
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
                  // @ts-ignore
                  const abs_path = path.relative(process.env.PROJECT_PATH, path.resolve(node.properties.path)).substring(6);
                return abs_path == clone.duplicationA.sourceId
              });
              var nodeB: any = nodes.find((node: Node) => {
                  // @ts-ignore
                  const abs_path = path.relative(process.env.PROJECT_PATH, path.resolve(node.properties.path)).substring(6);
                return abs_path == clone.duplicationB.sourceId
              });
                var percentA = (((clone.duplicationA.range[1] - clone.duplicationA.range[0]) / readFileSync(nodeA.properties.path, 'utf-8').length) * 100).toFixed(0);
                var percentB = (((clone.duplicationB.range[1] - clone.duplicationB.range[0]) / readFileSync(nodeB.properties.path, 'utf-8').length) * 100).toFixed(0);
                await this.neoGraph.linkTwoNodesWithCodeDuplicated(nodeA, nodeB, RelationType.CORE_CONTENT,
                    percentA, clone.duplicationA.start.line + ":" + clone.duplicationA.end.line);
                await this.neoGraph.linkTwoNodesWithCodeDuplicated(nodeB, nodeA, RelationType.CORE_CONTENT,
                     percentB, clone.duplicationB.start.line + ":" + clone.duplicationB.end.line);
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
            let fileA = clone.duplicationA.sourceId;
            let fileB = clone.duplicationB.sourceId;
            if(fileA === fileB){
                continue;
            }else if(fileA.endsWith(".test.ts") || fileA.endsWith("Test.ts")||fileA.endsWith(".spec.ts")||fileA.endsWith(".d.ts") || fileA.endsWith(".tsx")){
                continue;
            }else if(fileB.endsWith(".test.ts") || fileB.endsWith("Test.ts")||fileB.endsWith(".spec.ts")||fileB.endsWith(".d.ts") || fileB.endsWith(".tsx")){
                continue;
            }

            var nodeA: any = nodes.find((node: Node) => {
                // @ts-ignore
              const abs_path = path.relative(process.env.PROJECT_PATH, path.resolve(node.properties.path)).substring(6);
              return abs_path == clone.duplicationA.sourceId
            });
            var nodeB: any = nodes.find((node: Node) => {
                // @ts-ignore
              const abs_path = path.relative(process.env.PROJECT_PATH, path.resolve(node.properties.path)).substring(6);
              return abs_path == clone.duplicationB.sourceId
            });
            if(nodeA === undefined || nodeB === undefined){
                console.log("ERROR: nodeA or nodeB is undefined");
                console.log("A path: "+clone.duplicationA.sourceId);
                console.log("B path: "+clone.duplicationB.sourceId);
                continue;
            }

            var percentA = (((clone.duplicationA.range[1] - clone.duplicationA.range[0]) / readFileSync(nodeA.properties.path, 'utf-8').length) * 100).toFixed(0);
            var percentB = (((clone.duplicationB.range[1] - clone.duplicationB.range[0]) / readFileSync(nodeB.properties.path, 'utf-8').length) * 100).toFixed(0);
            await this.neoGraph.linkTwoNodesWithCodeDuplicated(nodeA, nodeB, RelationType.CODE_DUPLICATED,
                percentA, clone.duplicationA.start.line +":"+ clone.duplicationA.end.line);
            await this.neoGraph.linkTwoNodesWithCodeDuplicated(nodeB, nodeA, RelationType.CODE_DUPLICATED,
                percentB, clone.duplicationB.start.line +":"+ clone.duplicationB.end.line);
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
