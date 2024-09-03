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
import SymfinderVisitor from "./SymfinderVisitor";
import {EntityAttribut, EntityType, RelationType} from "../neograph/NodeType";
import NeoGraph from "../neograph/NeoGraph";
import {
    HeritageClause,
    ImportDeclaration,
    isHeritageClause,
    isImportDeclaration,
    isImportSpecifier,
    SyntaxKind
} from "typescript";
import {join} from 'path'
import {filname_from_filepath} from '../utils/path'
import {Node} from "neo4j-driver-core";
import {Mutex} from "async-mutex";
import path = require("path");

export default class GraphBuilderVisitor extends SymfinderVisitor{

    heritageMutex = new Mutex();
    importMutex = new Mutex();

    constructor(neoGraph: NeoGraph){
        super(neoGraph);
    }

    async visit(node: HeritageClause): Promise<void>;
    async visit(node: ImportDeclaration): Promise<void>;

    /**
     * Visit HeritageClause | ImportDeclaration | ExportSpecifier
     * @param node AST node
     * @returns ...
     */
    async visit(node: HeritageClause | ImportDeclaration): Promise<void> {

        if(isHeritageClause(node)) await this.visitHeritageClause(node);
        else if(isImportDeclaration(node)) await this.visitImportDeclaration(node);
        return;
    }

    /**
     * Visit HeritageClause to link classes and super class or interface in neo4j
     * @param node AST node
     * @returns 
     */
    async visitHeritageClause(node: HeritageClause): Promise<void>{
        
        if(node.parent.name === undefined) return;
        var className: string = node.parent.name?.getText();
        // var classType: EntityType;
        var superClassesName: string[] = node.types.map((type) => type.expression.getText());
        var superClasseType: EntityType;
        var relationType: RelationType;
        // var fileName = node.getSourceFile().fileName;
        // @ts-ignore
        // var fileName = path.relative(process.env.PROJECT_PATH, node.getSourceFile().fileName).substring(6);
        var fileName = node.getSourceFile().fileName.replace(/^.*?experiments_volume\//, '');
        /*if(node.parent.kind == SyntaxKind.InterfaceDeclaration)
            classType = EntityType.INTERFACE;
        else if(node.parent.kind == SyntaxKind.ClassDeclaration)
            classType = EntityType.CLASS;
        else {
            console.log("Unknown EntityType "+node.parent.kind+"...");
            return;
        }*/

        if(node.token == SyntaxKind.ImplementsKeyword){
            superClasseType = EntityType.INTERFACE;
            relationType = RelationType.IMPLEMENTS;
        }
        else if(node.token == SyntaxKind.ExtendsKeyword){
            superClasseType = EntityType.CLASS;
            relationType = RelationType.EXTENDS;
        }
        else {
            console.log("Unknown RelationType "+node.parent.kind+"...");
            return;
        }

        for(let scn of superClassesName){
            var superClassNode:Node = await this.heritageMutex.runExclusive(async () => {
                return await this.neoGraph.getOrCreateNode(scn, superClasseType, [EntityAttribut.OUT_OF_SCOPE], []);
            });
            if (superClassNode !== undefined) {
                var classNode = await this.neoGraph.getNodeWithFile(className, fileName)
                if (classNode !== undefined)
                    await this.neoGraph.linkTwoNodes(superClassNode, classNode, relationType);
                else
                    console.log("Cannot get " + className + " with file " + fileName + "...");
            } else
                console.log("Cannot get " + scn + "...");
        };
        return;
    }

    /**
     * Visit ImportedDeclaration to link entities between 2 files in neo4j
     * @param node AST node
     * @returns 
     */
    async visitImportDeclaration(node: ImportDeclaration): Promise<void>{

        // @ts-ignore
        // var filePath = path.relative(process.env.PROJECT_PATH, node.getSourceFile().fileName).substring(6);
        var filePath = node.getSourceFile().fileName.replace(/^.*?experiments_volume\//, '');

        var fileName = filname_from_filepath(filePath);
        var importedFileName: string;
        var importedFilePath: string;
        var importedModule = (<any>node.moduleSpecifier).text;
        var fileNode = await this.neoGraph.getNodeWithPath(fileName, filePath);
        if(fileNode === undefined ||importedModule === undefined){
            console.log("Cannot find file : '" + filePath + "' in graph...");
            return;
        }

        if(importedModule.startsWith('.') || importedModule.startsWith('..')){
            importedFileName = importedModule.split('/').slice(-1)[0] + '.ts';
            importedFilePath = join(filePath.split('/').slice(0, -1).join('/'),importedModule + '.ts');
        } else if(/([a-zA-Z]+\/)*[a-zA-Z]+/.test(importedModule)) {
            importedFileName = importedModule.split('/').slice(-1) + '.ts';
            const filePathSplit = filePath.split("/");
            const commonFolderIndex = filePathSplit.indexOf(importedModule.split("/")[0]);
            importedFilePath = filePathSplit.slice(0, commonFolderIndex).join("/") + "/" + importedModule + '.ts';
        } else{
            importedFileName = importedModule;
            importedFilePath = "";
        }

        var importedFileNode = await this.importMutex.runExclusive(() => this.neoGraph.getOrCreateNodeWithPath(importedFileName, importedFilePath, EntityType.FILE, [EntityAttribut.OUT_OF_SCOPE], []));
        if(importedFileNode !== undefined)
            await this.neoGraph.linkTwoNodes(fileNode, importedFileNode, RelationType.LOAD);
        else
            console.log("Error to link nodes "+filePath+" and "+importedFilePath+" cannot get imported file path node...");

        var importSpecifiers = (<any>node.importClause?.namedBindings)?.elements
        if(importSpecifiers !== undefined){
            for(let child of importSpecifiers){
                if(isImportSpecifier(child)){
                    var importedElementName: string = child.propertyName !== undefined ? child.propertyName.getText() : child.name.getText();
                    var importedElementNode = await this.neoGraph.getNodeWithFile(importedElementName, importedFilePath);

                    if(importedElementNode !== undefined)
                        await this.neoGraph.linkTwoNodes(fileNode, importedElementNode, RelationType.IMPORT);
                }
            }
        }
        if(node.importClause?.name !== undefined){
            var importedElementName = node.importClause.name.getText();
            var importedElementNode = await this.neoGraph.getNodeWithFile(importedElementName, importedFilePath);
            if(importedElementNode !== undefined){
                await this.neoGraph.linkTwoNodes(fileNode, importedElementNode, RelationType.IMPORT);
            }
        }
    }

}
