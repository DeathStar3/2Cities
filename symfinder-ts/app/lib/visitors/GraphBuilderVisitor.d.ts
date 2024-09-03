import SymfinderVisitor from "./SymfinderVisitor";
import NeoGraph from "../neograph/NeoGraph";
import { HeritageClause, ImportDeclaration } from "typescript";
import { Mutex } from "async-mutex";
export default class GraphBuilderVisitor extends SymfinderVisitor {
    heritageMutex: Mutex;
    importMutex: Mutex;
    constructor(neoGraph: NeoGraph);
    visit(node: HeritageClause): Promise<void>;
    visit(node: ImportDeclaration): Promise<void>;
    /**
     * Visit HeritageClause to link classes and super class or interface in neo4j
     * @param node AST node
     * @returns
     */
    visitHeritageClause(node: HeritageClause): Promise<void>;
    /**
     * Visit ImportedDeclaration to link entities between 2 files in neo4j
     * @param node AST node
     * @returns
     */
    visitImportDeclaration(node: ImportDeclaration): Promise<void>;
}
