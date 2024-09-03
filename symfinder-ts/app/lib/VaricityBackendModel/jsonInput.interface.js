"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisksProjectPaths = exports.MetricObject = void 0;
var MetricObject = /** @class */ (function () {
    function MetricObject(name, value) {
        this.name = name;
        this.value = value;
    }
    return MetricObject;
}());
exports.MetricObject = MetricObject;
var DisksProjectPaths = /** @class */ (function () {
    function DisksProjectPaths(symFinderFilePath, externalFilePaths) {
        this.symFinderFilePath = symFinderFilePath;
        this.externalFilePaths = externalFilePaths;
    }
    return DisksProjectPaths;
}());
exports.DisksProjectPaths = DisksProjectPaths;
