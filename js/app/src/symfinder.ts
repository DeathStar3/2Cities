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
import StrategyVisitor from "./visitors/StrategyVisitor"
import DecoratorFactoryTemplateVisitor from "./visitors/DecoratorFactoryTemplateVisitor"
import Parser from "./parser/Parser";
import NeoGraph from "./neograph/NeoGraph";
import {Configuration} from "./configuration/Configuration";
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
    config: any;

    constructor(runner: string){
        this.config = new Configuration(runner);
        this.neoGraph = new NeoGraph(this.config);
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
        if(!analysis_base) {
            await this.visitPackage(files, new GraphBuilderVisitor(this.neoGraph), "relations", program, true);
            await this.visitPackage(files, new StrategyVisitor(this.neoGraph), "strategies", program, true);
            await this.visitPackage(files, usageVisitor, "usages", program, false);
            await this.visitPackage(files, new DecoratorFactoryTemplateVisitor(this.neoGraph), "decorators, factories, templates", program, true);
            await this.neoGraph.detectVPsAndVariants();
            await this.proximityFolderDetection();
        } else {
            await this.neoGraph.markNodesAsBase();
        }

        const timeEnd = Date.now();

        // await this.neoGraph.exportToJSON();
        // let content = await this.neoGraph.exportRelationJSON(src);
        // if(http_path !== "") {
        //     await this.sendToServer(src, http_path, content);
        //     console.log("Sent to server " + http_path)
        // }
        // console.log("db fetched");

        let stats = new FileStats();
        stats.files_count = files.length;
        stats.variants_count = await this.neoGraph.getTotalNbVariants();
        stats.relationships_count = await this.neoGraph.getNbRelationships();
        stats.nodes_count = await this.neoGraph.getNbNodes();
        stats.unknown_paths_count = usageVisitor.getUnknownPaths().size;
        console.log("Number of VPs: " + await this.neoGraph.getTotalNbVPs());
        console.log("Number of methods VPs: " + await this.neoGraph.getNbMethodVPs());
        console.log("Number of constructor VPs: " + await this.neoGraph.getNbConstructorVPs());
        console.log("Number of method level VPs: " + await this.neoGraph.getNbMethodLevelVPs());
        console.log("Number of class level VPs: " + await this.neoGraph.getNbClassLevelVPs())
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
        let projectRoot = path.replace(/^.*?experiments_volume\//, '');
        await this.neoGraph.createNodeWithPath(folderName, projectRoot, EntityType.DIRECTORY, []);
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
        if(parentFolderName.startsWith(".")) return files;
        let parentPath = path.replace(/^.*?experiments_volume\//, '')
        var parentNode = await this.neoGraph.getNodeWithPath(parentFolderName, parentPath);
        if(parentNode === undefined) return files;

        for(let fileName of readdirSync(path)){
            let nodeProjectPath = join(parentPath, fileName)
            const absolute_path = join(path, fileName);
            if (statSync(absolute_path).isDirectory()){
                if(!fileName.includes('test') && !fileName.includes('Test')){
                    var folderNode: Node = await this.neoGraph.createNodeWithPath(fileName, nodeProjectPath, EntityType.DIRECTORY, []);
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
                    var fileNode = await this.neoGraph.createNodeWithPath(fileName, nodeProjectPath, EntityType.FILE, []);
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
            process.stdout.write("\rSearch core files: "+ (((i) / len) * 100).toFixed(0) +"% ("+i+"/"+len+")");
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
        }
        if(i > 0)
            process.stdout.write("\rSearch core files: "+ (((i) / len) * 100).toFixed(0) +"% ("+i+"/"+len+"), done.\n");
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
        console.log(result)
        console.log("\n################Sending request ...\n")
        await axios.post(http_path, result).catch((reason: any) => console.log(reason))
                                                    .then(() => console.log("Data has been correctly sent"))
    }
}
