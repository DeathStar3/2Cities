import SymfinderVisitor from "./SymfinderVisitor";
import NeoGraph from "../neograph/NeoGraph";
import { ClassDeclaration, ClassExpression, ConstructorDeclaration, ForOfStatement, FunctionDeclaration, InterfaceDeclaration, MethodDeclaration, MethodSignature, ModuleDeclaration, ParameterDeclaration, PropertyDeclaration, VariableStatement } from "typescript";
export default class ClassesVisitor extends SymfinderVisitor {
    analysis_base: boolean;
    constructor(neoGraph: NeoGraph, analysis_base: boolean);
    visit(node: InterfaceDeclaration): Promise<void>;
    visit(node: ClassDeclaration | ClassExpression): Promise<void>;
    visit(node: MethodDeclaration): Promise<void>;
    visit(node: MethodSignature): Promise<void>;
    visit(node: ConstructorDeclaration): Promise<void>;
    visit(node: FunctionDeclaration): Promise<void>;
    visit(node: VariableStatement): Promise<void>;
    visit(node: ParameterDeclaration): Promise<void>;
    visit(node: PropertyDeclaration): Promise<void>;
    visit(node: ForOfStatement): Promise<void>;
    visit(node: ModuleDeclaration): Promise<void>;
    /**
     * Visit InterfaceDeclaration and publish Interface in neo4j
     * @param node
     * @returns
     */
    visitInterface(node: InterfaceDeclaration): Promise<void>;
    /**
     * Visit ClassDeclaration | ClassExpression and publish Class in neo4j
     * @param node AST node
     * @returns
     */
    visitClass(node: ClassDeclaration | ClassExpression): Promise<void>;
    /**
     * Visit MethodDeclaration | MethodSignature | ConstructorDeclaration and publish Method and Constructor in neo4j
     * @param node AST node
     * @returns
     */
    visitMethod(node: MethodDeclaration | MethodSignature | ConstructorDeclaration): Promise<void>;
    /**
     * Visit FunctionDeclaration and publish Function in neo4j
     * @param node AST node
     * @returns
     */
    visitFunction(node: FunctionDeclaration): Promise<void>;
    /**
     * Visit VariableStatement and publish variable in neo4j
     * @param node AST node
     * @returns
     */
    visitVariable(node: VariableStatement): Promise<void>;
    visitForVariables(node: ForOfStatement): Promise<void>;
    visitParameter(node: ParameterDeclaration): Promise<void>;
    visitProperty(node: PropertyDeclaration): Promise<void>;
    visitModule(node: ModuleDeclaration): Promise<void>;
}
