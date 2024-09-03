import {MetricClassInterface} from "./jsonInput.interface";

export class ExperimentResult {
    projectName: string;
    symfinderResult: SymfinderResult;
    externalMetric: Map<string, MetricClassInterface[]>;

    constructor(projectName: string) {
        this.projectName = projectName;
        this.symfinderResult = new SymfinderResult();
        this.externalMetric = new Map<string, MetricClassInterface[]>();
    }
}

export class SymfinderResult {
    vpJsonGraph: string;
    statisticJson: string;

    constructor() {
        this.vpJsonGraph = "";
        this.statisticJson = "";
    }
}