import SymfinderVisitor from "./SymfinderVisitor";
import NeoGraph from "../neograph/NeoGraph";
import { PropertyDeclaration } from "typescript";
export default class StrategyVisitor extends SymfinderVisitor {
    constructor(neoGraph: NeoGraph);
    visit(node: PropertyDeclaration): Promise<void>;
}
