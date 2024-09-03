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
import { isPropertyDeclaration, Node, PropertyDeclaration } from "typescript";

export default class StrategyVisitor extends SymfinderVisitor{

    constructor(neoGraph: NeoGraph){
        super(neoGraph);
    }

    async visit(node: PropertyDeclaration): Promise<void>;

    /**
     * Visit PropertyDeclaration to detect Strategy pattern
     * @param node AST node
     * @returns ...
     */
    async visit(node: PropertyDeclaration): Promise<void> {

        if (!isPropertyDeclaration(node) || node.type === undefined) {
            return;
        }

        
        
        var propertyTypeName = node.type.getText();
        var propertyTypeNode = await this.neoGraph.getNode(propertyTypeName);
        if (propertyTypeNode !== undefined){
            var propertyTypeNbVariant: number = await this.neoGraph.getNbVariant(propertyTypeNode);
            if (propertyTypeName.includes("Strategy") || propertyTypeNbVariant >= 2){
                return await this.neoGraph.addLabelToNode(propertyTypeNode, DesignPatternType.STRATEGY);
            }
        }
        return;
    }
}