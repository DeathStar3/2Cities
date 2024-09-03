"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var SymfinderVisitor_1 = require("./SymfinderVisitor");
var NodeType_1 = require("../neograph/NodeType");
var typescript_1 = require("typescript");
var path_1 = require("path");
var path_2 = require("../utils/path");
var async_mutex_1 = require("async-mutex");
var GraphBuilderVisitor = /** @class */ (function (_super) {
    __extends(GraphBuilderVisitor, _super);
    function GraphBuilderVisitor(neoGraph) {
        var _this = _super.call(this, neoGraph) || this;
        _this.heritageMutex = new async_mutex_1.Mutex();
        _this.importMutex = new async_mutex_1.Mutex();
        return _this;
    }
    /**
     * Visit HeritageClause | ImportDeclaration | ExportSpecifier
     * @param node AST node
     * @returns ...
     */
    GraphBuilderVisitor.prototype.visit = function (node) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(0, typescript_1.isHeritageClause)(node)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.visitHeritageClause(node)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        if (!(0, typescript_1.isImportDeclaration)(node)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.visitImportDeclaration(node)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Visit HeritageClause to link classes and super class or interface in neo4j
     * @param node AST node
     * @returns
     */
    GraphBuilderVisitor.prototype.visitHeritageClause = function (node) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var className, superClassesName, superClasseType, relationType, fileName, _loop_1, this_1, superClassNode, classNode, _i, superClassesName_1, scn;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (node.parent.name === undefined)
                            return [2 /*return*/];
                        className = (_a = node.parent.name) === null || _a === void 0 ? void 0 : _a.getText();
                        superClassesName = node.types.map(function (type) { return type.expression.getText(); });
                        fileName = node.getSourceFile().fileName.replace(/^.*?experiments_volume\//, '');
                        /*if(node.parent.kind == SyntaxKind.InterfaceDeclaration)
                            classType = EntityType.INTERFACE;
                        else if(node.parent.kind == SyntaxKind.ClassDeclaration)
                            classType = EntityType.CLASS;
                        else {
                            console.log("Unknown EntityType "+node.parent.kind+"...");
                            return;
                        }*/
                        if (node.token == typescript_1.SyntaxKind.ImplementsKeyword) {
                            superClasseType = NodeType_1.EntityType.INTERFACE;
                            relationType = NodeType_1.RelationType.IMPLEMENTS;
                        }
                        else if (node.token == typescript_1.SyntaxKind.ExtendsKeyword) {
                            superClasseType = NodeType_1.EntityType.CLASS;
                            relationType = NodeType_1.RelationType.EXTENDS;
                        }
                        else {
                            console.log("Unknown RelationType " + node.parent.kind + "...");
                            return [2 /*return*/];
                        }
                        _loop_1 = function (scn) {
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0: return [4 /*yield*/, this_1.heritageMutex.runExclusive(function () { return __awaiter(_this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4 /*yield*/, this.neoGraph.getOrCreateNode(scn, superClasseType, [NodeType_1.EntityAttribut.OUT_OF_SCOPE], [])];
                                                    case 1: return [2 /*return*/, _a.sent()];
                                                }
                                            });
                                        }); })];
                                    case 1:
                                        superClassNode = _c.sent();
                                        if (!(superClassNode !== undefined)) return [3 /*break*/, 6];
                                        return [4 /*yield*/, this_1.neoGraph.getNodeWithFile(className, fileName)];
                                    case 2:
                                        classNode = _c.sent();
                                        if (!(classNode !== undefined)) return [3 /*break*/, 4];
                                        return [4 /*yield*/, this_1.neoGraph.linkTwoNodes(superClassNode, classNode, relationType)];
                                    case 3:
                                        _c.sent();
                                        return [3 /*break*/, 5];
                                    case 4:
                                        console.log("Cannot get " + className + " with file " + fileName + "...");
                                        _c.label = 5;
                                    case 5: return [3 /*break*/, 7];
                                    case 6:
                                        console.log("Cannot get " + scn + "...");
                                        _c.label = 7;
                                    case 7: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, superClassesName_1 = superClassesName;
                        _b.label = 1;
                    case 1:
                        if (!(_i < superClassesName_1.length)) return [3 /*break*/, 4];
                        scn = superClassesName_1[_i];
                        return [5 /*yield**/, _loop_1(scn)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        ;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Visit ImportedDeclaration to link entities between 2 files in neo4j
     * @param node AST node
     * @returns
     */
    GraphBuilderVisitor.prototype.visitImportDeclaration = function (node) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var filePath, fileName, importedFileName, importedFilePath, importedModule, fileNode, filePathSplit, commonFolderIndex, importedFileNode, importSpecifiers, _i, importSpecifiers_1, child, importedElementName, importedElementNode, importedElementName, importedElementNode;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        filePath = node.getSourceFile().fileName.replace(/^.*?experiments_volume\//, '');
                        fileName = (0, path_2.filname_from_filepath)(filePath);
                        importedModule = node.moduleSpecifier.text;
                        return [4 /*yield*/, this.neoGraph.getNodeWithPath(fileName, filePath)];
                    case 1:
                        fileNode = _d.sent();
                        if (fileNode === undefined) {
                            console.log("Cannot find file : '" + filePath + "' in graph...");
                            return [2 /*return*/];
                        }
                        if (importedModule.startsWith('.') || importedModule.startsWith('..')) {
                            importedFileName = importedModule.split('/').slice(-1)[0] + '.ts';
                            importedFilePath = (0, path_1.join)(filePath.split('/').slice(0, -1).join('/'), importedModule + '.ts');
                        }
                        else if (/([a-zA-Z]+\/)*[a-zA-Z]+/.test(importedModule)) {
                            importedFileName = importedModule.split('/').slice(-1) + '.ts';
                            filePathSplit = filePath.split("/");
                            commonFolderIndex = filePathSplit.indexOf(importedModule.split("/")[0]);
                            importedFilePath = filePathSplit.slice(0, commonFolderIndex).join("/") + "/" + importedModule + '.ts';
                        }
                        else {
                            importedFileName = importedModule;
                            importedFilePath = "";
                        }
                        return [4 /*yield*/, this.importMutex.runExclusive(function () { return _this.neoGraph.getOrCreateNodeWithPath(importedFileName, importedFilePath, NodeType_1.EntityType.FILE, [NodeType_1.EntityAttribut.OUT_OF_SCOPE], []); })];
                    case 2:
                        importedFileNode = _d.sent();
                        if (!(importedFileNode !== undefined)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.neoGraph.linkTwoNodes(fileNode, importedFileNode, NodeType_1.RelationType.LOAD)];
                    case 3:
                        _d.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        console.log("Error to link nodes " + filePath + " and " + importedFilePath + " cannot get imported file path node...");
                        _d.label = 5;
                    case 5:
                        importSpecifiers = (_b = (_a = node.importClause) === null || _a === void 0 ? void 0 : _a.namedBindings) === null || _b === void 0 ? void 0 : _b.elements;
                        if (!(importSpecifiers !== undefined)) return [3 /*break*/, 10];
                        _i = 0, importSpecifiers_1 = importSpecifiers;
                        _d.label = 6;
                    case 6:
                        if (!(_i < importSpecifiers_1.length)) return [3 /*break*/, 10];
                        child = importSpecifiers_1[_i];
                        if (!(0, typescript_1.isImportSpecifier)(child)) return [3 /*break*/, 9];
                        importedElementName = child.propertyName !== undefined ? child.propertyName.getText() : child.name.getText();
                        return [4 /*yield*/, this.neoGraph.getNodeWithFile(importedElementName, importedFilePath)];
                    case 7:
                        importedElementNode = _d.sent();
                        if (!(importedElementNode !== undefined)) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.neoGraph.linkTwoNodes(fileNode, importedElementNode, NodeType_1.RelationType.IMPORT)];
                    case 8:
                        _d.sent();
                        _d.label = 9;
                    case 9:
                        _i++;
                        return [3 /*break*/, 6];
                    case 10:
                        if (!(((_c = node.importClause) === null || _c === void 0 ? void 0 : _c.name) !== undefined)) return [3 /*break*/, 13];
                        importedElementName = node.importClause.name.getText();
                        return [4 /*yield*/, this.neoGraph.getNodeWithFile(importedElementName, importedFilePath)];
                    case 11:
                        importedElementNode = _d.sent();
                        if (!(importedElementNode !== undefined)) return [3 /*break*/, 13];
                        return [4 /*yield*/, this.neoGraph.linkTwoNodes(fileNode, importedElementNode, NodeType_1.RelationType.IMPORT)];
                    case 12:
                        _d.sent();
                        _d.label = 13;
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    return GraphBuilderVisitor;
}(SymfinderVisitor_1.default));
exports.default = GraphBuilderVisitor;
