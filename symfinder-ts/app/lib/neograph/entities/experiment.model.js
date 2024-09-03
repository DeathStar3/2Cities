"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymfinderResult = exports.ExperimentResult = void 0;
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
