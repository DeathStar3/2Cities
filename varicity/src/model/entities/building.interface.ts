import {Node, NodeElement} from './../../controller/parser/symfinder_elements/nodes/node.element';
import {Metrics} from "../entitiesImplems/metrics.model";
import { Color3 } from "@babylonjs/core";

export abstract class Building implements Node {
    name: string;
    types: string[];
    nbAttributes: number;
    nbFunctions: number;
    nbVariants: number;
    nbConstructorVariants: number;
    nbMethodVariants: number;
    metrics: Metrics;

    width: number;
    height: number;

    compLevel: number;

    exportedClasses: Node[];

    isCloned: boolean
    cloneCrown: Node

    constructor() {
        this.types = [];
    }

    abstract getHeight(field: string): number;

    abstract getWidth(field: string): number;

    // setCloned(isCloned: boolean) {
    //     this.isCloned = isCloned
    // }
}
