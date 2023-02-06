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
    SymbolFlags,
    TypeFlags,
    VariableDeclaration
} from "typescript";
import {RelationType} from "../neograph/NodeType";
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
        // console.log("=="+name+"==")
        if (name === undefined) return;
        // @ts-ignore
        var filePath = path.relative(process.env.PROJECT_PATH, node.getSourceFile().fileName).substring(6);

        let className = "";
        let classPath = "";
        //TODO regarder comment récupérer chemin de la class depuis 'node.type'
        /*if(node.type !== undefined) {
            className = (<any>node.type).typeName.escapedText;
            console.log("node.type: ");
            console.log(node.type)
        } else {*/
        let type = this.program.getTypeChecker().getTypeAtLocation(node);
        if (type.flags != TypeFlags.Object || type.getSymbol() === undefined || (type as ObjectType).objectFlags != (ObjectFlags.Class + ObjectFlags.Reference)) return;
        if (type.symbol.flags === SymbolFlags.Method && node.type === undefined) return; //void method
        //TODO regarder comment récupérer chemin de la class depuis 'node.type' ou 'type'

        const qualifiedName = this.program.getTypeChecker().getFullyQualifiedName(type.getSymbol()!);
        // console.log(qualifiedName)
        let correctFormat = qualifiedName.match(/"([a-zA-Z0-9-._\/]+)"\.([a-zA-Z]+)/);
        if (correctFormat == null) {
/*            console.log(this.program.getTypeChecker().typeToString(type));
            console.log(this.program.getTypeChecker().getApparentType(type));
            console.log(this.program.getTypeChecker().getAugmentedPropertiesOfType(type));
            console.log(this.program.getTypeChecker().getBaseConstraintOfType(type));
            console.log(this.program.getTypeChecker().getBaseTypeOfLiteralType(type));
            console.log(this.program.getTypeChecker().getIndexInfosOfType(type));*/
            //TODO ajout test sur pls class dans même fichier
            // console.log("'" + qualifiedName + "' doesn't contain the path and the class name");
            this.unknownPaths.add(qualifiedName);
            classPath = filePath;
            className = qualifiedName;
        } else {
            classPath = correctFormat[1];
            className = correctFormat[2];
            // @ts-ignore
            classPath = path.relative(process.env.PROJECT_PATH, classPath).substring(6) + ".ts";
        }

        // className = type.symbol.getName();
        // console.log(qualifiedName);
        // console.log(type);
        //     classPath = (<any>type.symbol).parent.getEscapedName();
        //     classPath = classPath.substring(1, classPath.length - 1);
        //     if(className === "default") { // Arrive quand une class est de type default
        //         className = filname_from_filepath(classPath);
        //     }
        //}
        // console.log(name+" - "+filePath)
        // console.log(className+" - "+classPath)
        const varNode = await this.neoGraph.getNodeWithFile(name, filePath);
        if(varNode != undefined) {
            let classNode = await this.neoGraph.getClassNodeWithPath(className, classPath);
            if (classNode == undefined)
                classNode = await this.neoGraph.getClassNodeWithImport(className, filePath);
            if (classNode != undefined)
                return await this.neoGraph.linkTwoNodes(varNode, classNode, RelationType.TYPE_OF);
            else {
                /*console.log(name+" - "+filePath)
                console.log(varNode)
                console.log(className+" - "+classPath)
                console.log(classNode)*/
                console.log(filePath+" > Error to link 'usage' nodes " + name + " and " + className + "...");
            }
        } else {
            new URL("");
            console.log(filePath+" > Error to link 'usage' nodes because no node named '" + name + "' or with the file path '" + filePath + "' exists");
        }
    }

    getUnknownPaths(): Set<string> {
        return this.unknownPaths;
    }

}
