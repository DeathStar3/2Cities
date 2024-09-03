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
import SymfinderVisitor from "../visitors/SymfinderVisitor";
import {Node, Program, SourceFile} from 'typescript';

export default class Parser{

    sourceFile: SourceFile;
    
    constructor(file: string, program: Program) {
        const srcFile: SourceFile | undefined = program.getSourceFile(file);
        if(srcFile != undefined)
            this.sourceFile = srcFile;
        else
            throw new FileNotFoundException(file);
        // this.sourceFile = createSourceFile(file, readFileSync(file, 'utf8'), ScriptTarget.Latest, true);
    }

    async accept(visitor: SymfinderVisitor) {
        await visitor.visit(this.sourceFile);
        await this.visit(this.sourceFile, visitor);
    }

    async visit(node: Node, visitor: SymfinderVisitor){
        for(let child of node.getChildren()){
            await visitor.visit(child);
            await this.visit(child, visitor);
        }
    }

}

export class FileNotFoundException extends Error {
    constructor(fileName: String) {
        super(fileName+" isn't in the project");

        Object.setPrototypeOf(this, FileNotFoundException.prototype);
    }
}
