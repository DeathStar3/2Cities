import { Node } from "typescript";
import NeoGraph from "../neograph/NeoGraph";
export default abstract class SymfinderVisitor {
    neoGraph: NeoGraph;
    constructor(neoGraph: NeoGraph);
    abstract visit(node: Node): Promise<void>;
}
