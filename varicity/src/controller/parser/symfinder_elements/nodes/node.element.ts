import {Metrics} from "../../../../model/entitiesImplems/metrics.model";
import {MetricObject} from "../../../../model/entitiesImplems/metricObject.model";
import {NodeInterface} from "../../../../model/entities/jsonInput.interface";
import { Color3 } from "@babylonjs/core";

export interface Node {
    name: string;
    types: string[];
    metrics: Metrics;
    exportedClasses: Node[];
    cloneCrown?: Node;
    variantFileColor?: string;
    maxClone?: number;
}

export class NodeElement implements Node {
    name: string;
    types: string[];
    metrics: Metrics;

    analyzed: boolean;
    root: boolean;
    compositionLevel: number = -1;
    origin: string = "";
    exportedClasses: Node[];
    cloneCrown?: NodeElement;
    variantFileColor?: string;
    maxClone?: number;

    constructor(name: string) {
        this.name = name;
        this.analyzed = false;
        this.root = true;
        this.metrics = new Metrics();
        this.exportedClasses = [];
    }

    // public addMetric(metric: MetricObject){
    //     this.metrics.addMetric(metric);
    // }

    addMetric(metricName: string, value: number) {
        return this.metrics.addMetric(new MetricObject(metricName, value));
    }

    public fillMetricsFromNodeInterface(nodeI: NodeInterface) {
        if (nodeI.additionalMetrics !== undefined) {
            nodeI.additionalMetrics.forEach(metric => {
                this.metrics.addMetric(new MetricObject(metric.name, metric.value));
            })
        }
    }
}

export enum VariabilityMetricsName {
    NB_METHOD_VARIANTS = "nbMethodVariants",
    NB_FUNCTIONS = "nbFunctions",
    NB_ATTRIBUTES = "nbAttributes",
    NB_CONSTRUCTOR_VARIANTS = "nbConstructorVariants",
    NB_VARIANTS = "nbVariants",
    NB_CLONES = "nbClones"
}
