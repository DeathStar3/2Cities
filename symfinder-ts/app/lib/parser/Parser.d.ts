import SymfinderVisitor from "../visitors/SymfinderVisitor";
import { Node, Program, SourceFile } from 'typescript';
export default class Parser {
    sourceFile: SourceFile;
    constructor(file: string, program: Program);
    accept(visitor: SymfinderVisitor): Promise<void>;
    visit(node: Node, visitor: SymfinderVisitor): Promise<void>;
}
export declare class FileNotFoundException extends Error {
    constructor(fileName: String);
}
