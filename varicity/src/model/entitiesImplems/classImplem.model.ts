import {Node} from '../../controller/parser/symfinder_elements/nodes/node.element';
import {Building} from "../entities/building.interface";

export class ClassImplem extends Building {

    constructor(node: Node, level: number) {
        super();
        Object.assign(this, node);
        this.compLevel = level;
    }

    public getHeight(field: string): number {
        return 0.5 + this.metrics.getMetricValue(field) * 0.5;
    }

    public getWidth(field: string): number {
        return 0.5 + this.metrics.getMetricValue(field) * 0.5;
    }
}
