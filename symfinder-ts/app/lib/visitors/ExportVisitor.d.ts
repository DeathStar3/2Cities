import SymfinderVisitor from "./SymfinderVisitor";
import NeoGraph from "../neograph/NeoGraph";
import { Program, SourceFile, Symbol, SymbolFlags, TypeChecker } from "typescript";
import { EntityType } from "../neograph/NodeType";
import { Mutex } from "async-mutex";
export default class ExportVisitor extends SymfinderVisitor {
    program: Program;
    exportMutex: Mutex;
    unknownSourcesMutex: Mutex;
    unknownSources: number;
    constructor(neoGraph: NeoGraph, program: Program);
    visit(node: SourceFile): Promise<void>;
    getPath(symbol: Symbol): string;
    getOriginalSymbol(symbol: Symbol, checker: TypeChecker): Symbol | undefined;
    isPathCorrect(symbolPath: string): boolean;
    getNode(symbol: Symbol, filePath: string): Promise<import("neo4j-driver-core/types/graph-types").Node<import("neo4j-driver-core/types/integer").default, {
        [key: string]: any;
    }> | undefined>;
    symbolFlagsToEntityType(flags: SymbolFlags): EntityType.CLASS | EntityType.INTERFACE;
    incrementUnknownSource(count?: number): void;
    getUnknownSourcesCount(): number;
    isAcceptedType(flags: SymbolFlags): boolean;
}
