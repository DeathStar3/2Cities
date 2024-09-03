import SymfinderVisitor from "./SymfinderVisitor";
import NeoGraph from "../neograph/NeoGraph";
import { ClassDeclaration } from "typescript";
export default class DecoratorFactoryTemplateVisitor extends SymfinderVisitor {
    constructor(neoGraph: NeoGraph);
    visit(node: ClassDeclaration): Promise<void>;
}
