import SymfinderVisitor from "./SymfinderVisitor";
import NeoGraph from "../neograph/NeoGraph";
import { MethodDeclaration, ParameterDeclaration, Program, PropertyDeclaration, Set, VariableDeclaration } from "typescript";
export default class UsageVisitor extends SymfinderVisitor {
    private program;
    unknownPaths: Set<string>;
    constructor(neoGraph: NeoGraph, program: Program);
    visit(node: VariableDeclaration): Promise<void>;
    visit(node: ParameterDeclaration): Promise<void>;
    visit(node: PropertyDeclaration): Promise<void>;
    visit(node: MethodDeclaration): Promise<void>;
    getUnknownPaths(): Set<string>;
}
