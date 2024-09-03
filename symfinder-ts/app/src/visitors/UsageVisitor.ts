import SymfinderVisitor from "./SymfinderVisitor";
import NeoGraph from "../neograph/NeoGraph";
import {
    isMethodDeclaration,
    isParameter,
    isPropertyDeclaration,
    isVariableDeclaration,
    MethodDeclaration,
    ObjectFlags,
    ObjectType,
    ParameterDeclaration,
    Program,
    PropertyDeclaration, Set,
    SymbolFlags, SyntaxKind,
    TypeFlags,
    VariableDeclaration
} from "typescript";
import {EntityType, RelationType} from "../neograph/NodeType";
import path = require("path");

export default class UsageVisitor extends SymfinderVisitor {

    unknownPaths: Set<string>;

    constructor(neoGraph: NeoGraph, private program: Program) {
        super(neoGraph);
        this.unknownPaths = new Set<string>();
    }

    async visit(node: VariableDeclaration): Promise<void>;
    async visit(node: ParameterDeclaration): Promise<void>;
    async visit(node: PropertyDeclaration): Promise<void>;
    async visit(node: MethodDeclaration): Promise<void>;

    /**
     * Visit different kind of variables found and publish their class type in neo4j
     * @param node AST node
     * @returns
     */
    async visit(node: VariableDeclaration | ParameterDeclaration | PropertyDeclaration | MethodDeclaration): Promise<void> {
        if (!isVariableDeclaration(node) && !isParameter(node) && !isPropertyDeclaration(node) && !isMethodDeclaration(node)) return;

        const name = node.name?.getText();
        if (name === undefined) return;
        // @ts-ignore
        // const filePath = path.relative(process.env.PROJECT_PATH, node.getSourceFile().fileName).substring(6);
        const filePath = node.getSourceFile().fileName.replace(/^.*?experiments_volume\//, '');
        let className = "";
        let classPath = "";

        let type = this.program.getTypeChecker().getTypeAtLocation(node);
        if (type.flags != TypeFlags.Object || type.getSymbol() === undefined || (type as ObjectType).objectFlags != (ObjectFlags.Class + ObjectFlags.Reference)) return;
        if (type.symbol.flags === SymbolFlags.Method && node.type === undefined) return; //void method

        const qualifiedName = this.program.getTypeChecker().getFullyQualifiedName(type.getSymbol()!);
        let correctFormat = qualifiedName.match(/^"([a-zA-Z0-9-._\/]+)"\.([a-zA-Z_0-9.]+)$/);
        if (correctFormat == null) {
            classPath = filePath;
            className = qualifiedName;
        } else {
            classPath = correctFormat[1];
            className = correctFormat[2];
            if(classPath.includes("/")) {
                // @ts-ignore
                classPath = path.relative(process.env.PROJECT_PATH, classPath).substring(6) + ".ts";
            }
        }

        let entType;
        switch(node.kind) {
            case SyntaxKind.VariableDeclaration:
                entType = EntityType.VARIABLE;
                break;
            case SyntaxKind.Parameter:
                entType = EntityType.PARAMETER;
                break;
            case SyntaxKind.PropertyDeclaration:
                entType = EntityType.PROPERTY;
                break;
            case SyntaxKind.MethodDeclaration:
                entType = EntityType.METHOD;
                break;
        }

        const varNode = await this.neoGraph.getElementNodeWithFile(name, entType, filePath);
        if(varNode != undefined) {
            let classNode;
            if(classPath.includes("/")) {
                if(className.includes(".")) {
                    const module_class: string[] = className.split(".");
                    classNode = await this.neoGraph.getClassNodeByModule(module_class[1], module_class[0], classPath);
                } else
                    classNode = await this.neoGraph.getClassNodeWithPath(className, classPath);
            } else
                classNode = await this.neoGraph.getClassNodeByModuleIfUnique(className, classPath);
            if (classNode == undefined)
                classNode = await this.neoGraph.getClassNodeWithImport(className, filePath);
            if(classNode == undefined)
                classNode = await this.neoGraph.getClassNodeIfUnique(className);
            if (classNode != undefined)
                await this.neoGraph.linkTwoNodes(varNode, classNode, RelationType.TYPE_OF);
            else {
                this.unknownPaths.add(qualifiedName);
                console.log(filePath+" > Error to link 'usage' nodes " + name + " and " + className + "...");
            }
        } else {
            console.log("Error to link 'usage' nodes because no node named '" + name + "' or with the file path '" + filePath + "' exists");
        }
    }

    getUnknownPaths(): Set<string> {
        return this.unknownPaths;
    }

}
