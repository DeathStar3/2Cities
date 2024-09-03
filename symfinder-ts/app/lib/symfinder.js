"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Symfinder = void 0;
/*
 * This file is part of symfinder.
 *
 * symfinder is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * symfinder is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with symfinder. If not, see <http://www.gnu.org/licenses/>.
 *
 * Copyright 2021-2022 Bruel Martin <martin.bruel999@gmail.com>
 */
var ClassesVisitor_1 = require("./visitors/ClassesVisitor");
var GraphBuilderVisitor_1 = require("./visitors/GraphBuilderVisitor");
var StrategyVisitor_1 = require("./visitors/StrategyVisitor");
var DecoratorFactoryTemplateVisitor_1 = require("./visitors/DecoratorFactoryTemplateVisitor");
var Parser_1 = require("./parser/Parser");
var NeoGraph_1 = require("./neograph/NeoGraph");
var Configuration_1 = require("./configuration/Configuration");
var path_1 = require("path");
var fs_1 = require("fs");
var NodeType_1 = require("./neograph/NodeType");
var axios_1 = require("axios");
var typescript_1 = require("typescript");
var UsageVisitor_1 = require("./visitors/UsageVisitor");
var file_stats_1 = require("./utils/file_stats");
var Symfinder = /** @class */ (function () {
    function Symfinder(runner) {
        this.config = new Configuration_1.Configuration(runner);
        this.neoGraph = new NeoGraph_1.default(this.config);
    }
    /**
     * run symfinder for the specific project
     * @param src path to the root directory
     * @param http_path
     * @param analysis_base if it's an analysis of a base library
     * @param stats_file create or not a file with some statistics
     */
    Symfinder.prototype.run = function (src, http_path, analysis_base, stats_file) {
        return __awaiter(this, void 0, void 0, function () {
            var timeStart, files, options, program, usageVisitor, timeEnd, stats, _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, classes;
            return __generator(this, function (_18) {
                switch (_18.label) {
                    case 0: return [4 /*yield*/, this.neoGraph.clearNodes()];
                    case 1:
                        _18.sent();
                        console.log("Analyse variability in : '" + src + "'");
                        timeStart = Date.now();
                        return [4 /*yield*/, this.visitAllFiles(src)];
                    case 2:
                        files = _18.sent();
                        process.stdout.write("\rDetecting files (" + files.length + "): done.\x1b[K\n");
                        options = { strict: true, target: typescript_1.ScriptTarget.Latest, allowJs: true, module: typescript_1.ModuleKind.ES2015 };
                        program = (0, typescript_1.createProgram)(files, options, (0, typescript_1.createCompilerHost)(options, true));
                        return [4 /*yield*/, this.visitPackage(files, new ClassesVisitor_1.default(this.neoGraph, analysis_base), "classes", program, true)];
                    case 3:
                        _18.sent();
                        usageVisitor = new UsageVisitor_1.default(this.neoGraph, program);
                        if (!!analysis_base) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.visitPackage(files, new GraphBuilderVisitor_1.default(this.neoGraph), "relations", program, true)];
                    case 4:
                        _18.sent();
                        return [4 /*yield*/, this.visitPackage(files, new StrategyVisitor_1.default(this.neoGraph), "strategies", program, true)];
                    case 5:
                        _18.sent();
                        return [4 /*yield*/, this.visitPackage(files, usageVisitor, "usages", program, false)];
                    case 6:
                        _18.sent();
                        return [4 /*yield*/, this.visitPackage(files, new DecoratorFactoryTemplateVisitor_1.default(this.neoGraph), "decorators, factories, templates", program, true)];
                    case 7:
                        _18.sent();
                        return [4 /*yield*/, this.neoGraph.detectVPsAndVariants()];
                    case 8:
                        _18.sent();
                        return [4 /*yield*/, this.proximityFolderDetection()];
                    case 9:
                        _18.sent();
                        return [3 /*break*/, 12];
                    case 10: return [4 /*yield*/, this.neoGraph.markNodesAsBase()];
                    case 11:
                        _18.sent();
                        _18.label = 12;
                    case 12:
                        timeEnd = Date.now();
                        stats = new file_stats_1.FileStats();
                        stats.files_count = files.length;
                        _a = stats;
                        return [4 /*yield*/, this.neoGraph.getTotalNbVariants()];
                    case 13:
                        _a.variants_count = _18.sent();
                        _b = stats;
                        return [4 /*yield*/, this.neoGraph.getNbRelationships()];
                    case 14:
                        _b.relationships_count = _18.sent();
                        _c = stats;
                        return [4 /*yield*/, this.neoGraph.getNbNodes()];
                    case 15:
                        _c.nodes_count = _18.sent();
                        stats.unknown_paths_count = usageVisitor.getUnknownPaths().size;
                        _e = (_d = console).log;
                        _f = "Number of VPs: ";
                        return [4 /*yield*/, this.neoGraph.getTotalNbVPs()];
                    case 16:
                        _e.apply(_d, [_f + (_18.sent())]);
                        _h = (_g = console).log;
                        _j = "Number of methods VPs: ";
                        return [4 /*yield*/, this.neoGraph.getNbMethodVPs()];
                    case 17:
                        _h.apply(_g, [_j + (_18.sent())]);
                        _l = (_k = console).log;
                        _m = "Number of constructor VPs: ";
                        return [4 /*yield*/, this.neoGraph.getNbConstructorVPs()];
                    case 18:
                        _l.apply(_k, [_m + (_18.sent())]);
                        _p = (_o = console).log;
                        _q = "Number of method level VPs: ";
                        return [4 /*yield*/, this.neoGraph.getNbMethodLevelVPs()];
                    case 19:
                        _p.apply(_o, [_q + (_18.sent())]);
                        _s = (_r = console).log;
                        _t = "Number of class level VPs: ";
                        return [4 /*yield*/, this.neoGraph.getNbClassLevelVPs()];
                    case 20:
                        _s.apply(_r, [_t + (_18.sent())]);
                        console.log("Number of variants: " + stats.variants_count);
                        _v = (_u = console).log;
                        _w = "Number of methods variants: ";
                        return [4 /*yield*/, this.neoGraph.getNbMethodVariants()];
                    case 21:
                        _v.apply(_u, [_w + (_18.sent())]);
                        _y = (_x = console).log;
                        _z = "Number of constructors variants: ";
                        return [4 /*yield*/, this.neoGraph.getNbConstructorVariants()];
                    case 22:
                        _y.apply(_x, [_z + (_18.sent())]);
                        _1 = (_0 = console).log;
                        _2 = "Number of method level variants: ";
                        return [4 /*yield*/, this.neoGraph.getNbMethodLevelVariants()];
                    case 23:
                        _1.apply(_0, [_2 + (_18.sent())]);
                        _4 = (_3 = console).log;
                        _5 = "Number of class level variants: ";
                        return [4 /*yield*/, this.neoGraph.getNbClassLevelVariants()];
                    case 24:
                        _4.apply(_3, [_5 + (_18.sent())]);
                        _7 = (_6 = console).log;
                        _8 = "Number of variant files: ";
                        return [4 /*yield*/, this.neoGraph.getNbVariantFiles()];
                    case 25:
                        _7.apply(_6, [_8 + (_18.sent())]);
                        _10 = (_9 = console).log;
                        _11 = "Number of variant folder: ";
                        return [4 /*yield*/, this.neoGraph.getNbVariantFolders()];
                    case 26:
                        _10.apply(_9, [_11 + (_18.sent())]);
                        _13 = (_12 = console).log;
                        _14 = "Number of vp folder: ";
                        return [4 /*yield*/, this.neoGraph.getNbVPFolders()];
                    case 27:
                        _13.apply(_12, [_14 + (_18.sent())]);
                        _16 = (_15 = console).log;
                        _17 = "Number of proximity entities: ";
                        return [4 /*yield*/, this.neoGraph.getNbProximityEntity()];
                    case 28:
                        _16.apply(_15, [_17 + (_18.sent())]);
                        console.log("Number of nodes: " + stats.nodes_count);
                        console.log("Number of relationships: " + stats.relationships_count);
                        console.log("Duration: " + this.msToTime(timeEnd - timeStart));
                        if (!!analysis_base) return [3 /*break*/, 30];
                        return [4 /*yield*/, this.neoGraph.getAllClass()];
                    case 29:
                        classes = _18.sent();
                        console.log("Number of unknown class path: " + ((stats.unknown_paths_count / (classes.length + stats.unknown_paths_count)) * 100).toFixed(2) + "% (" + stats.unknown_paths_count + "/" + classes.length + ")");
                        _18.label = 30;
                    case 30:
                        if (stats_file)
                            stats.write();
                        return [4 /*yield*/, this.neoGraph.driver.close()];
                    case 31:
                        _18.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Symfinder.prototype.msToTime = function (duration) {
        var milliseconds = Math.floor((duration % 1000) / 100), seconds = Math.floor((duration / 1000) % 60), minutes = Math.floor((duration / (1000 * 60)) % 60), hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;
        return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
    };
    /**
     * Visit all source code files with the given visitor (visitor pattern)
     * @param files to visit
     * @param visitor class wich contain analysis
     * @param label logger label
     * @param program the program
     * @param async determines if the function executes the analyses in async or sync
     */
    Symfinder.prototype.visitPackage = function (files, visitor, label, program, async) {
        return __awaiter(this, void 0, void 0, function () {
            var nbFiles, currentFile, analyse, _i, files_1, file, parser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nbFiles = files.length;
                        currentFile = 0;
                        analyse = [];
                        _i = 0, files_1 = files;
                        _a.label = 1;
                    case 1:
                        if (!(_i < files_1.length)) return [3 /*break*/, 5];
                        file = files_1[_i];
                        parser = new Parser_1.default(file, program);
                        if (!async) return [3 /*break*/, 2];
                        analyse.push(parser.accept(visitor).then(function (_) {
                            currentFile++;
                            process.stdout.write("\rResolving " + label + ": " + ((100 * currentFile) / nbFiles).toFixed(0) + "% (" + currentFile + "/" + nbFiles + ")");
                        }));
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, parser.accept(visitor)];
                    case 3:
                        _a.sent();
                        currentFile++;
                        process.stdout.write("\rResolving " + label + ": " + ((100 * currentFile) / nbFiles).toFixed(0) + "% (" + currentFile + "/" + nbFiles + ")");
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5:
                        if (!async) return [3 /*break*/, 7];
                        return [4 /*yield*/, Promise.all(analyse)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        process.stdout.write("\rResolving " + label + ": " + ((100 * currentFile) / nbFiles).toFixed(0) + "% (" + currentFile + "/" + nbFiles + ")" + ", done.\n");
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Visit all files of the selected project and annoted them in the neo4j graph
     * @param path to the root directory
     * @returns source code files to analyse
     */
    Symfinder.prototype.visitAllFiles = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var folderName, projectRoot;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        folderName = path.split('/').pop();
                        if (folderName === undefined)
                            return [2 /*return*/, []];
                        projectRoot = path.replace(/^.*?experiments_volume\//, '');
                        console.log("in all files");
                        console.log(path);
                        console.log(projectRoot);
                        return [4 /*yield*/, this.neoGraph.createNodeWithPath(folderName, projectRoot, NodeType_1.EntityType.DIRECTORY, [])];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.visitFiles(path, [])];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Visit file recursively at the specific path
     * @param path to the current directory which is visited
     * @param files all files already visited
     * @returns all files visited
     */
    Symfinder.prototype.visitFiles = function (path, files) {
        return __awaiter(this, void 0, void 0, function () {
            var parentFolderName, parentPath, parentNode, _i, _a, fileName, nodeProjectPath, absolute_path, folderNode, newFiles, fileNode;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        parentFolderName = path.split('/').slice(-1)[0];
                        if (parentFolderName === undefined)
                            return [2 /*return*/, files];
                        if (parentFolderName.startsWith("."))
                            return [2 /*return*/, files];
                        parentPath = path.replace(/^.*?experiments_volume\//, '');
                        console.log("in files");
                        console.log(parentPath);
                        return [4 /*yield*/, this.neoGraph.getNodeWithPath(parentFolderName, parentPath)];
                    case 1:
                        parentNode = _b.sent();
                        if (parentNode === undefined)
                            return [2 /*return*/, files];
                        _i = 0, _a = (0, fs_1.readdirSync)(path);
                        _b.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 12];
                        fileName = _a[_i];
                        nodeProjectPath = (0, path_1.join)(parentPath, fileName);
                        console.log(nodeProjectPath);
                        absolute_path = (0, path_1.join)(path, fileName);
                        console.log(absolute_path);
                        if (!(0, fs_1.statSync)(absolute_path).isDirectory()) return [3 /*break*/, 8];
                        if (!(!fileName.includes('test') && !fileName.includes('Test'))) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.neoGraph.createNodeWithPath(fileName, nodeProjectPath, NodeType_1.EntityType.DIRECTORY, [])];
                    case 3:
                        folderNode = _b.sent();
                        return [4 /*yield*/, this.neoGraph.linkTwoNodes(parentNode, folderNode, NodeType_1.RelationType.CHILD)];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, this.visitFiles(absolute_path, files)];
                    case 5:
                        newFiles = _b.sent();
                        files.concat(newFiles);
                        return [3 /*break*/, 7];
                    case 6:
                        process.stdout.write("\rFolder '" + fileName + "' exclude...                                                            \n");
                        _b.label = 7;
                    case 7: return [3 /*break*/, 11];
                    case 8:
                        if (!(fileName.endsWith(".ts") && !fileName.endsWith(".usage.ts") && !fileName.endsWith("Test.ts") && !fileName.endsWith("test.ts") && !fileName.endsWith("tests.ts") && !fileName.endsWith(".spec.ts") && !fileName.endsWith(".d.ts"))) return [3 /*break*/, 11];
                        process.stdout.write("\rDetecting files (" + files.length + "): '" + fileName + "'\x1b[K");
                        files.push(absolute_path);
                        return [4 /*yield*/, this.neoGraph.createNodeWithPath(fileName, nodeProjectPath, NodeType_1.EntityType.FILE, [])];
                    case 9:
                        fileNode = _b.sent();
                        return [4 /*yield*/, this.neoGraph.linkTwoNodes(parentNode, fileNode, NodeType_1.RelationType.CHILD)];
                    case 10:
                        _b.sent();
                        _b.label = 11;
                    case 11:
                        _i++;
                        return [3 /*break*/, 2];
                    case 12: return [2 /*return*/, files];
                }
            });
        });
    };
    /**
     * Detect folder with the proximity analyse describe in scientific TER article
     * This method annoted folder and files with :
     * VP_FOLDER
     * VARIANT_FOLDER
     * VARIANT_FILE
     * SUPER_VARIANT_FILE
     */
    Symfinder.prototype.proximityFolderDetection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var vpFoldersPath, i, len, _i, vpFoldersPath_1, vpFolderPath, variantFilesNameSet, foldersPath, isSuperVariantFile, _a, variantFilesNameSet_1, variantFileName, superVariantFilesNode, _b, foldersPath_1, folderPath, currentFile, _c, superVariantFilesNode_1, superVariantFileNode;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.neoGraph.setProximityFolder()];
                    case 1:
                        _d.sent();
                        return [4 /*yield*/, this.neoGraph.getAllVPFoldersPath()];
                    case 2:
                        vpFoldersPath = _d.sent();
                        i = 0;
                        len = vpFoldersPath.length;
                        _i = 0, vpFoldersPath_1 = vpFoldersPath;
                        _d.label = 3;
                    case 3:
                        if (!(_i < vpFoldersPath_1.length)) return [3 /*break*/, 16];
                        vpFolderPath = vpFoldersPath_1[_i];
                        i++;
                        process.stdout.write("\rSearch core files: " + (((i) / len) * 100).toFixed(0) + "% (" + i + "/" + len + ")");
                        return [4 /*yield*/, this.neoGraph.getVariantFilesNameForVPFolderPath(vpFolderPath)];
                    case 4:
                        variantFilesNameSet = _d.sent();
                        return [4 /*yield*/, this.neoGraph.getFoldersPathForVPFolderPath(vpFolderPath)];
                    case 5:
                        foldersPath = _d.sent();
                        isSuperVariantFile = true;
                        _a = 0, variantFilesNameSet_1 = variantFilesNameSet;
                        _d.label = 6;
                    case 6:
                        if (!(_a < variantFilesNameSet_1.length)) return [3 /*break*/, 15];
                        variantFileName = variantFilesNameSet_1[_a];
                        superVariantFilesNode = [];
                        _b = 0, foldersPath_1 = foldersPath;
                        _d.label = 7;
                    case 7:
                        if (!(_b < foldersPath_1.length)) return [3 /*break*/, 10];
                        folderPath = foldersPath_1[_b];
                        return [4 /*yield*/, this.neoGraph.getVariantFileForFolderPath(folderPath, variantFileName)];
                    case 8:
                        currentFile = _d.sent();
                        if (currentFile === undefined) {
                            isSuperVariantFile = false;
                            return [3 /*break*/, 10];
                        }
                        else
                            superVariantFilesNode.push(currentFile);
                        _d.label = 9;
                    case 9:
                        _b++;
                        return [3 /*break*/, 7];
                    case 10:
                        if (!isSuperVariantFile) return [3 /*break*/, 14];
                        _c = 0, superVariantFilesNode_1 = superVariantFilesNode;
                        _d.label = 11;
                    case 11:
                        if (!(_c < superVariantFilesNode_1.length)) return [3 /*break*/, 14];
                        superVariantFileNode = superVariantFilesNode_1[_c];
                        return [4 /*yield*/, this.neoGraph.addLabelToNode(superVariantFileNode, NodeType_1.EntityAttribut.CORE_FILE)];
                    case 12:
                        _d.sent();
                        _d.label = 13;
                    case 13:
                        _c++;
                        return [3 /*break*/, 11];
                    case 14:
                        _a++;
                        return [3 /*break*/, 6];
                    case 15:
                        _i++;
                        return [3 /*break*/, 3];
                    case 16:
                        if (i > 0)
                            process.stdout.write("\rSearch core files: " + (((i) / len) * 100).toFixed(0) + "% (" + i + "/" + len + "), done.\n");
                        return [2 /*return*/];
                }
            });
        });
    };
    Symfinder.prototype.createProjectJson = function (src, content) {
        var paths = src.split('/');
        return {
            projectName: paths[paths.length - 1],
            symfinderResult: {
                vpJsonGraph: content,
                statisticJson: ""
            },
            externalMetric: new Map()
        };
    };
    Symfinder.prototype.sendToServer = function (src, http_path, content) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("CREATE PROJECT JSON : ");
                        result = this.createProjectJson(src, content);
                        console.log(result);
                        console.log("\n################Sending request ...\n");
                        return [4 /*yield*/, axios_1.default.post(http_path, result).catch(function (reason) { return console.log(reason); })
                                .then(function () { return console.log("Data has been correctly sent"); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Symfinder;
}());
exports.Symfinder = Symfinder;
