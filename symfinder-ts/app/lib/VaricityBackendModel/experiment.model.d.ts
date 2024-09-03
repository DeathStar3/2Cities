import { MetricClassInterface } from './jsonInput.interface';
export declare class ExperimentResult {
    projectName: string;
    symfinderResult: SymfinderResult;
    externalMetric: Map<string, MetricClassInterface[]>;
    constructor(projectName: string);
}
export declare class SymfinderResult {
    vpJsonGraph: string;
    statisticJson: string;
}
export declare class ProjectEntry {
    projectName: string;
    path: string;
    constructor(_projectName: string, _path: string);
}
export declare class ConfigEntry {
    id?: string;
    name?: string;
    projectId?: string;
    description?: string;
    username?: string;
    path?: string;
    filename?: string;
    isDefault?: boolean;
    constructor(name: string, path: string, projectId: string);
}
