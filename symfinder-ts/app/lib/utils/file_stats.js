"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStats = void 0;
var fs_1 = require("fs");
var FileStats = /** @class */ (function () {
    function FileStats() {
        this.files_count = 0;
        this.variants_count = 0;
        this.nodes_count = 0;
        this.relationships_count = 0;
        this.unknown_paths_count = 0;
        this.unknown_export_sources = 0;
    }
    FileStats.prototype.write = function () {
        (0, fs_1.writeFile)('result_stats.json', JSON.stringify(this), { flag: "w" }, function (err) {
            if (err)
                throw err;
            console.log('stats written to file');
        });
    };
    return FileStats;
}());
exports.FileStats = FileStats;
