import SymfinderVisitor from "./visitors/SymfinderVisitor";
import NeoGraph from "./neograph/NeoGraph";
import { Program } from "typescript";
export declare class Symfinder {
    neoGraph: NeoGraph;
    config: any;
    constructor(runner: string);
    /**
     * run symfinder for the specific project
     * @param src path to the root directory
     * @param http_path
     * @param analysis_base if it's an analysis of a base library
     * @param stats_file create or not a file with some statistics
     */
    run(src: string, http_path: string, analysis_base: boolean, stats_file: boolean): Promise<void>;
    msToTime(duration: number): string;
    /**
     * Visit all source code files with the given visitor (visitor pattern)
     * @param files to visit
     * @param visitor class wich contain analysis
     * @param label logger label
     * @param program the program
     * @param async determines if the function executes the analyses in async or sync
     */
    visitPackage(files: string[], visitor: SymfinderVisitor, label: string, program: Program, async: boolean): Promise<void>;
    /**
     * Visit all files of the selected project and annoted them in the neo4j graph
     * @param path to the root directory
     * @returns source code files to analyse
     */
    visitAllFiles(path: string): Promise<string[]>;
    /**
     * Visit file recursively at the specific path
     * @param path to the current directory which is visited
     * @param files all files already visited
     * @returns all files visited
     */
    visitFiles(path: string, files: string[]): Promise<string[]>;
    /**
     * Detect folder with the proximity analyse describe in scientific TER article
     * This method annoted folder and files with :
     * VP_FOLDER
     * VARIANT_FOLDER
     * VARIANT_FILE
     * SUPER_VARIANT_FILE
     */
    proximityFolderDetection(): Promise<void>;
    private createProjectJson;
    private sendToServer;
}
