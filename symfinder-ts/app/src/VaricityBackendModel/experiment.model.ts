import { MetricClassInterface } from './jsonInput.interface';

const pathLib = require('path');

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
  vpJsonGraph: string = "";
  statisticJson: string = "";


}

export class ProjectEntry {
  projectName: string;
  path: string;

  constructor(_projectName: string, _path: string) {
    this.path = _path;
    this.projectName = _projectName;
  }
}

export class ConfigEntry {
  id?: string; //for persistence
  name?: string;
  projectId?: string; //for persistence
  description?: string;
  username?: string;
  path?: string;
  filename?: string;
  isDefault?: boolean;

  constructor(name: string, path: string, projectId: string) {
    this.name = name;
    this.path = path;
    this.projectId = projectId;

    this.filename = pathLib.parse(this.path).name;
  }
}
