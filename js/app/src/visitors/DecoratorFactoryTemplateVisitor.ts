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
import { DesignPatternType } from "../neograph/NodeType";
import NeoGraph from "../neograph/NeoGraph";
import { isClassDeclaration, ClassDeclaration, Node } from "typescript";

export default class DecoratorFactoryTemplateVisitor extends SymfinderVisitor{

    constructor(neoGraph: NeoGraph){
        super(neoGraph);
    }

    async visit(node: ClassDeclaration): Promise<void>;

    /**
     * Detect Decorator, Template and Factory patterns based on name
     * @param node AST node
     * @returns ...
     */
    async visit(node: ClassDeclaration): Promise<void> {

        if (!isClassDeclaration(node) || node.kind === undefined || node.name === undefined) return;
        
        var className = node.name!.text;
        var graphNode = await this.neoGraph.getNode(className);
        if (graphNode !== undefined){
            if (className.includes("Decorator")) {
                return await this.neoGraph.addLabelToNode(graphNode, DesignPatternType.DECORATOR);
            }
            if (className.includes("Template")) {
                return await this.neoGraph.addLabelToNode(graphNode, DesignPatternType.TEMPLATE);
            }
            if (className.includes("Factory")) {
                return await this.neoGraph.addLabelToNode(graphNode, DesignPatternType.FACTORY);
            }
        }
        return;
    }
}