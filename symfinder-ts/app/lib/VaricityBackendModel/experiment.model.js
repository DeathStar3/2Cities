"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigEntry = exports.ProjectEntry = exports.SymfinderResult = exports.ExperimentResult = void 0;
var pathLib = require('path');
var ExperimentResult = /** @class */ (function () {
    function ExperimentResult(projectName) {
        this.projectName = projectName;
        this.symfinderResult = new SymfinderResult();
        this.externalMetric = new Map();
    }
    return ExperimentResult;
}());
exports.ExperimentResult = ExperimentResult;
var SymfinderResult = /** @class */ (function () {
    function SymfinderResult() {
        this.vpJsonGraph = "";
        this.statisticJson = "";
    }
    return SymfinderResult;
}());
exports.SymfinderResult = SymfinderResult;
var ProjectEntry = /** @class */ (function () {
    function ProjectEntry(_projectName, _path) {
        this.path = _path;
        this.projectName = _projectName;
    }
    return ProjectEntry;
}());
exports.ProjectEntry = ProjectEntry;
var ConfigEntry = /** @class */ (function () {
    function ConfigEntry(name, path, projectId) {
        this.name = name;
        this.path = path;
        this.projectId = projectId;
        this.filename = pathLib.parse(this.path).name;
    }
    return ConfigEntry;
}());
exports.ConfigEntry = ConfigEntry;
