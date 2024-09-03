import { MetricClassInterface } from "./jsonInput.interface";
export declare class ExperimentResult {
    projectName: string;
    symfinderResult: SymfinderResult;
    externalMetric: Map<string, MetricClassInterface[]>;
    constructor(projectName: string);
}
export declare class SymfinderResult {
    vpJsonGraph: string;
    statisticJson: string;
    constructor();
}
