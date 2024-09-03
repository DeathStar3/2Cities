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
var path_1 = require("../utils/path");
var ClassesVisitor = /** @class */ (function (_super) {
    __extends(ClassesVisitor, _super);
    function ClassesVisitor(neoGraph, analysis_base) {
        var _this = _super.call(this, neoGraph) || this;
        _this.analysis_base = analysis_base;
        return _this;
    }
    /**
     * Visit InterfaceDeclaration | ClassDeclaration | ClassExpression | MethodDeclaration | MethodSignature | ConstructorDeclaration | FunctionDeclaration | VariableStatement
     * @param node AST node
     * @returns ...
     */
    ClassesVisitor.prototype.visit = function (node) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(0, typescript_1.isInterfaceDeclaration)(node)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.visitInterface(node)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 18];
                    case 2:
                        if (!((0, typescript_1.isClassDeclaration)(node) || (0, typescript_1.isClassExpression)(node))) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.visitClass(node)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 18];
                    case 4:
                        if (!((0, typescript_1.isMethodDeclaration)(node) || (0, typescript_1.isMethodSignature)(node) || (0, typescript_1.isConstructorDeclaration)(node))) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.visitMethod(node)];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 18];
                    case 6:
                        if (!(0, typescript_1.isFunctionDeclaration)(node)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.visitFunction(node)];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 18];
                    case 8:
                        if (!(0, typescript_1.isPropertyDeclaration)(node)) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.visitProperty(node)];
                    case 9:
                        _a.sent();
                        return [3 /*break*/, 18];
                    case 10:
                        if (!(0, typescript_1.isModuleDeclaration)(node)) return [3 /*break*/, 12];
                        return [4 /*yield*/, this.visitModule(node)];
                    case 11:
                        _a.sent();
                        return [3 /*break*/, 18];
                    case 12:
                        if (!!this.analysis_base) return [3 /*break*/, 18];
                        if (!(0, typescript_1.isVariableStatement)(node)) return [3 /*break*/, 14];
                        return [4 /*yield*/, this.visitVariable(node)];
                    case 13:
                        _a.sent();
                        return [3 /*break*/, 18];
                    case 14:
                        if (!(0, typescript_1.isParameter)(node)) return [3 /*break*/, 16];
                        return [4 /*yield*/, this.visitParameter(node)];
                    case 15:
                        _a.sent();
                        return [3 /*break*/, 18];
                    case 16:
                        if (!(0, typescript_1.isForOfStatement)(node)) return [3 /*break*/, 18];
                        return [4 /*yield*/, this.visitForVariables(node)];
                    case 17:
                        _a.sent();
                        _a.label = 18;
                    case 18: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Visit InterfaceDeclaration and publish Interface in neo4j
     * @param node
     * @returns
     */
    ClassesVisitor.prototype.visitInterface = function (node) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var nodeType, modifiers, nodeVisibility, relationType, name, nodeTypeList, filePath, fileName;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        nodeType = NodeType_1.EntityType.INTERFACE;
                        modifiers = (_a = node.modifiers) === null || _a === void 0 ? void 0 : _a.map(function (m) { return m.kind; });
                        nodeVisibility = (modifiers === null || modifiers === void 0 ? void 0 : modifiers.includes(typescript_1.SyntaxKind.PrivateKeyword)) ? NodeType_1.EntityVisibility.PRIVATE : NodeType_1.EntityVisibility.PUBLIC;
                        relationType = (modifiers === null || modifiers === void 0 ? void 0 : modifiers.includes(typescript_1.SyntaxKind.ExportKeyword)) ? NodeType_1.RelationType.EXPORT : NodeType_1.RelationType.INTERNAL;
                        name = (_b = node.name) === null || _b === void 0 ? void 0 : _b.getText();
                        nodeTypeList = [nodeVisibility];
                        // @ts-ignore
                        console.log(node.getSourceFile().fileName);
                        filePath = node.getSourceFile().fileName.replace(/^.*?experiments_volume\//, '');
                        console.log(filePath);
                        fileName = (0, path_1.filname_from_filepath)(filePath);
                        return [4 /*yield*/, this.neoGraph.createNode(name, nodeType, nodeTypeList).then(function (neoNode) { return __awaiter(_this, void 0, void 0, function () {
                                var neoFileNode;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (filePath === undefined || fileName === undefined)
                                                return [2 /*return*/];
                                            return [4 /*yield*/, this.neoGraph.getNodeWithPath(fileName, filePath)];
                                        case 1:
                                            neoFileNode = _a.sent();
                                            if (!(neoFileNode !== undefined)) return [3 /*break*/, 3];
                                            return [4 /*yield*/, this.neoGraph.linkTwoNodes(neoFileNode, neoNode, relationType)];
                                        case 2: return [2 /*return*/, _a.sent()];
                                        case 3:
                                            console.log("Error to link nodes " + name + " and " + fileName + "...");
                                            _a.label = 4;
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            }); }).catch(function (reason) { return console.log("Error to create node " + name + "..."); })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Visit ClassDeclaration | ClassExpression and publish Class in neo4j
     * @param node AST node
     * @returns
     */
    ClassesVisitor.prototype.visitClass = function (node) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var name, nodeType, modifiers, nodeVisibility, relationType, nodeTypeList, filePath, fileName;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        name = (_a = node.name) === null || _a === void 0 ? void 0 : _a.getText();
                        if (name === undefined)
                            return [2 /*return*/];
                        nodeType = NodeType_1.EntityType.CLASS;
                        modifiers = (_b = node.modifiers) === null || _b === void 0 ? void 0 : _b.map(function (m) { return m.kind; });
                        nodeVisibility = (modifiers === null || modifiers === void 0 ? void 0 : modifiers.includes(typescript_1.SyntaxKind.PrivateKeyword)) ? NodeType_1.EntityVisibility.PRIVATE : NodeType_1.EntityVisibility.PUBLIC;
                        relationType = (modifiers === null || modifiers === void 0 ? void 0 : modifiers.includes(typescript_1.SyntaxKind.ExportKeyword)) ? NodeType_1.RelationType.EXPORT : NodeType_1.RelationType.INTERNAL;
                        nodeTypeList = [nodeVisibility];
                        if (modifiers === null || modifiers === void 0 ? void 0 : modifiers.includes(typescript_1.SyntaxKind.AbstractKeyword))
                            nodeTypeList.push(NodeType_1.EntityAttribut.ABSTRACT);
                        filePath = node.getSourceFile().fileName.replace(/^.*?experiments_volume\//, '');
                        fileName = (0, path_1.filname_from_filepath)(filePath);
                        return [4 /*yield*/, this.neoGraph.createNode(name, nodeType, nodeTypeList).then(function (neoNode) { return __awaiter(_this, void 0, void 0, function () {
                                var neoFileNode;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (filePath === undefined || fileName === undefined)
                                                return [2 /*return*/];
                                            return [4 /*yield*/, this.neoGraph.getNodeWithPath(fileName, filePath)];
                                        case 1:
                                            neoFileNode = _a.sent();
                                            if (!(neoFileNode !== undefined)) return [3 /*break*/, 3];
                                            return [4 /*yield*/, this.neoGraph.linkTwoNodes(neoFileNode, neoNode, relationType)];
                                        case 2: return [2 /*return*/, _a.sent()];
                                        case 3:
                                            console.log("Error to link nodes " + name + " and " + fileName + "...");
                                            _a.label = 4;
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            }); }).catch(function (reason) { return console.log("Error to create node " + name + "..."); })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Visit MethodDeclaration | MethodSignature | ConstructorDeclaration and publish Method and Constructor in neo4j
     * @param node AST node
     * @returns
     */
    ClassesVisitor.prototype.visitMethod = function (node) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var parentNode, className, modifiers, nodeVisibility, name, classModifiers, classVisibility, nodeTypeList, nodeType, filePath;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        parentNode = node.parent;
                        className = (_a = parentNode.name) === null || _a === void 0 ? void 0 : _a.getText();
                        if (className === undefined)
                            return [2 /*return*/];
                        modifiers = (_b = node.modifiers) === null || _b === void 0 ? void 0 : _b.map(function (m) { return m.kind; });
                        nodeVisibility = (modifiers === null || modifiers === void 0 ? void 0 : modifiers.includes(typescript_1.SyntaxKind.PrivateKeyword)) ? NodeType_1.EntityVisibility.PRIVATE : NodeType_1.EntityVisibility.PUBLIC;
                        name = (0, typescript_1.isConstructorDeclaration)(node) ? className : (_c = node.name) === null || _c === void 0 ? void 0 : _c.getText();
                        classModifiers = (_d = parentNode.modifiers) === null || _d === void 0 ? void 0 : _d.map(function (m) { return m.kind; });
                        classVisibility = (classModifiers === null || classModifiers === void 0 ? void 0 : classModifiers.includes(typescript_1.SyntaxKind.PrivateKeyword)) ? NodeType_1.EntityVisibility.PRIVATE : NodeType_1.EntityVisibility.PUBLIC;
                        nodeTypeList = [];
                        nodeType = (0, typescript_1.isConstructorDeclaration)(node) ? NodeType_1.EntityType.CONSTRUCTOR : NodeType_1.EntityType.METHOD;
                        filePath = node.getSourceFile().fileName.replace(/^.*?experiments_volume\//, '');
                        if (modifiers === null || modifiers === void 0 ? void 0 : modifiers.includes(typescript_1.SyntaxKind.AbstractKeyword))
                            nodeTypeList.push(NodeType_1.EntityAttribut.ABSTRACT);
                        if (classVisibility == NodeType_1.EntityVisibility.PUBLIC) {
                            nodeTypeList.push(nodeVisibility);
                        }
                        return [4 /*yield*/, this.neoGraph.createNode(name, nodeType, nodeTypeList).then(function (neoNode) { return __awaiter(_this, void 0, void 0, function () {
                                var neoClassNode;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (className === undefined)
                                                return [2 /*return*/];
                                            return [4 /*yield*/, this.neoGraph.getNodeWithFile(className, filePath)];
                                        case 1:
                                            neoClassNode = _a.sent();
                                            if (!(neoClassNode !== undefined)) return [3 /*break*/, 3];
                                            return [4 /*yield*/, this.neoGraph.linkTwoNodes(neoClassNode, neoNode, NodeType_1.RelationType.METHOD)];
                                        case 2: return [2 /*return*/, _a.sent()];
                                        case 3:
                                            console.log("Error to link nodes " + name + " and " + className + "...");
                                            _a.label = 4;
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            }); }).catch(function (reason) { return console.log("Error to create node " + name + "..."); })];
                    case 1: return [2 /*return*/, _e.sent()];
                }
            });
        });
    };
    /**
     * Visit FunctionDeclaration and publish Function in neo4j
     * @param node AST node
     * @returns
     */
    ClassesVisitor.prototype.visitFunction = function (node) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var name, filePath, fileName, modifiers, relationType, nodeTypeList, nodeType;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        name = (_a = node.name) === null || _a === void 0 ? void 0 : _a.getText();
                        if (name === undefined)
                            return [2 /*return*/];
                        filePath = node.getSourceFile().fileName.replace(/^.*?experiments_volume\//, '');
                        fileName = (0, path_1.filname_from_filepath)(filePath);
                        modifiers = (_b = node.modifiers) === null || _b === void 0 ? void 0 : _b.map(function (m) { return m.kind; });
                        relationType = (modifiers === null || modifiers === void 0 ? void 0 : modifiers.includes(typescript_1.SyntaxKind.ExportKeyword)) ? NodeType_1.RelationType.EXPORT : NodeType_1.RelationType.INTERNAL;
                        nodeTypeList = [];
                        nodeType = NodeType_1.EntityType.FUNCTION;
                        return [4 /*yield*/, this.neoGraph.createNode(name, nodeType, nodeTypeList).then(function (neoNode) { return __awaiter(_this, void 0, void 0, function () {
                                var neoFileNode;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (filePath === undefined || fileName === undefined)
                                                return [2 /*return*/];
                                            return [4 /*yield*/, this.neoGraph.getNodeWithPath(fileName, filePath)];
                                        case 1:
                                            neoFileNode = _a.sent();
                                            if (!(neoFileNode !== undefined)) return [3 /*break*/, 3];
                                            return [4 /*yield*/, this.neoGraph.linkTwoNodes(neoFileNode, neoNode, relationType)];
                                        case 2: return [2 /*return*/, _a.sent()];
                                        case 3:
                                            console.log("Error to link nodes " + name + " and " + fileName + "...");
                                            _a.label = 4;
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            }); }).catch(function (reason) { return console.log("Error to create node " + name + "..."); })];
                    case 1: return [2 /*return*/, _c.sent()];
                }
            });
        });
    };
    /**
     * Visit VariableStatement and publish variable in neo4j
     * @param node AST node
     * @returns
     */
    ClassesVisitor.prototype.visitVariable = function (node) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var modifiers, relationType, nodeTypeList, nodeType, filePath, fileName, _i, _c, variableDeclaration, name;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        modifiers = (_a = node.modifiers) === null || _a === void 0 ? void 0 : _a.map(function (m) { return m.kind; });
                        relationType = (modifiers === null || modifiers === void 0 ? void 0 : modifiers.includes(typescript_1.SyntaxKind.ExportKeyword)) ? NodeType_1.RelationType.EXPORT : NodeType_1.RelationType.INTERNAL;
                        nodeTypeList = [];
                        nodeType = NodeType_1.EntityType.VARIABLE;
                        filePath = node.getSourceFile().fileName.replace(/^.*?experiments_volume\//, '');
                        fileName = (0, path_1.filname_from_filepath)(filePath);
                        _i = 0, _c = node.declarationList.declarations;
                        _d.label = 1;
                    case 1:
                        if (!(_i < _c.length)) return [3 /*break*/, 4];
                        variableDeclaration = _c[_i];
                        name = (_b = variableDeclaration.name) === null || _b === void 0 ? void 0 : _b.getText();
                        if (name === undefined)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.neoGraph.createNode(name, nodeType, nodeTypeList).then(function (neoNode) { return __awaiter(_this, void 0, void 0, function () {
                                var neoFileNode;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (filePath === undefined || /*className*/ fileName === undefined)
                                                return [2 /*return*/];
                                            return [4 /*yield*/, this.neoGraph.getNodeWithPath(fileName, filePath)];
                                        case 1:
                                            neoFileNode = _a.sent();
                                            if (!(neoFileNode !== undefined)) return [3 /*break*/, 3];
                                            return [4 /*yield*/, this.neoGraph.linkTwoNodes(neoFileNode, neoNode, relationType)];
                                        case 2: return [2 /*return*/, _a.sent()];
                                        case 3:
                                            console.log("Error to link nodes " + name + " and " + /*className*/ fileName + "...");
                                            _a.label = 4;
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            }); }).catch(function (reason) { return console.log("Error to create node " + name + "..."); })];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ClassesVisitor.prototype.visitForVariables = function (node) {
        return __awaiter(this, void 0, void 0, function () {
            var nodeTypeList, nodeType, filePath, fileName, forVars, _i, forVars_1, variableDeclaration, name;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nodeTypeList = [];
                        nodeType = NodeType_1.EntityType.VARIABLE;
                        filePath = node.getSourceFile().fileName.replace(/^.*?experiments_volume\//, '');
                        fileName = (0, path_1.filname_from_filepath)(filePath);
                        forVars = node.initializer.kind === typescript_1.SyntaxKind.VariableDeclarationList ? node.initializer.declarations : [node.initializer];
                        _i = 0, forVars_1 = forVars;
                        _a.label = 1;
                    case 1:
                        if (!(_i < forVars_1.length)) return [3 /*break*/, 4];
                        variableDeclaration = forVars_1[_i];
                        name = variableDeclaration.getText();
                        if (name === undefined)
                            return [3 /*break*/, 3];
                        return [4 /*yield*/, this.neoGraph.createNode(name, nodeType, nodeTypeList).then(function (neoNode) { return __awaiter(_this, void 0, void 0, function () {
                                var neoFileNode;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (filePath === undefined || /*className*/ fileName === undefined)
                                                return [2 /*return*/];
                                            return [4 /*yield*/, this.neoGraph.getNodeWithPath(fileName, filePath)];
                                        case 1:
                                            neoFileNode = _a.sent();
                                            if (!(neoFileNode !== undefined)) return [3 /*break*/, 3];
                                            return [4 /*yield*/, this.neoGraph.linkTwoNodes(neoFileNode, neoNode, NodeType_1.RelationType.INTERNAL)];
                                        case 2: return [2 /*return*/, _a.sent()];
                                        case 3:
                                            console.log("Error to link nodes " + name + " and " + /*className*/ fileName + "...");
                                            _a.label = 4;
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            }); }).catch(function (reason) { return console.log("Error to create node " + name + "..."); })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ClassesVisitor.prototype.visitParameter = function (node) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var modifiers, relationType, nodeTypeList, nodeType, filePath, fileName, name;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        modifiers = (_a = node.modifiers) === null || _a === void 0 ? void 0 : _a.map(function (m) { return m.kind; });
                        relationType = (modifiers === null || modifiers === void 0 ? void 0 : modifiers.includes(typescript_1.SyntaxKind.ExportKeyword)) ? NodeType_1.RelationType.EXPORT : NodeType_1.RelationType.INTERNAL;
                        nodeTypeList = [];
                        nodeType = NodeType_1.EntityType.PARAMETER;
                        filePath = node.getSourceFile().fileName.replace(/^.*?experiments_volume\//, '');
                        fileName = (0, path_1.filname_from_filepath)(filePath);
                        name = (_b = node.name) === null || _b === void 0 ? void 0 : _b.getText();
                        if (name === undefined)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.neoGraph.createNode(name, nodeType, nodeTypeList).then(function (neoNode) { return __awaiter(_this, void 0, void 0, function () {
                                var neoFileNode;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (filePath === undefined || /*className*/ fileName === undefined)
                                                return [2 /*return*/];
                                            return [4 /*yield*/, this.neoGraph.getNodeWithPath(fileName, filePath)];
                                        case 1:
                                            neoFileNode = _a.sent();
                                            if (!(neoFileNode !== undefined)) return [3 /*break*/, 3];
                                            return [4 /*yield*/, this.neoGraph.linkTwoNodes(neoFileNode, neoNode, relationType)];
                                        case 2: return [2 /*return*/, _a.sent()];
                                        case 3:
                                            console.log("Error to link nodes " + name + " and " + /*className*/ fileName + "...");
                                            _a.label = 4;
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            }); }).catch(function (reason) { return console.log("Error to create node " + name + "..."); })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ClassesVisitor.prototype.visitProperty = function (node) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var modifiers, relationType, nodeTypeList, nodeType, filePath, fileName, name;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        modifiers = (_a = node.modifiers) === null || _a === void 0 ? void 0 : _a.map(function (m) { return m.kind; });
                        relationType = (modifiers === null || modifiers === void 0 ? void 0 : modifiers.includes(typescript_1.SyntaxKind.ExportKeyword)) ? NodeType_1.RelationType.EXPORT : NodeType_1.RelationType.INTERNAL;
                        nodeTypeList = [];
                        nodeType = NodeType_1.EntityType.PROPERTY;
                        filePath = node.getSourceFile().fileName.replace(/^.*?experiments_volume\//, '');
                        fileName = (0, path_1.filname_from_filepath)(filePath);
                        name = (_b = node.name) === null || _b === void 0 ? void 0 : _b.getText();
                        if (name === undefined)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.neoGraph.createNode(name, nodeType, nodeTypeList).then(function (neoNode) { return __awaiter(_this, void 0, void 0, function () {
                                var neoFileNode;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (filePath === undefined || /*className*/ fileName === undefined)
                                                return [2 /*return*/];
                                            return [4 /*yield*/, this.neoGraph.getNodeWithPath(fileName, filePath)];
                                        case 1:
                                            neoFileNode = _a.sent();
                                            if (!(neoFileNode !== undefined)) return [3 /*break*/, 3];
                                            return [4 /*yield*/, this.neoGraph.linkTwoNodes(neoFileNode, neoNode, relationType)];
                                        case 2: return [2 /*return*/, _a.sent()];
                                        case 3:
                                            console.log("Error to link nodes " + name + " and " + /*className*/ fileName + "...");
                                            _a.label = 4;
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            }); }).catch(function (reason) { return console.log("Error to create node " + name + "..."); })];
                    case 1:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ClassesVisitor.prototype.visitModule = function (node) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var name, modifiers, relationType, filePath, fileName;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        name = node.name.getText();
                        modifiers = (_a = node.modifiers) === null || _a === void 0 ? void 0 : _a.map(function (m) { return m.kind; });
                        relationType = (modifiers === null || modifiers === void 0 ? void 0 : modifiers.includes(typescript_1.SyntaxKind.ExportKeyword)) ? NodeType_1.RelationType.EXPORT : NodeType_1.RelationType.INTERNAL;
                        filePath = node.getSourceFile().fileName.replace(/^.*?experiments_volume\//, '');
                        fileName = (0, path_1.filname_from_filepath)(filePath);
                        return [4 /*yield*/, this.neoGraph.createNodeWithPath(name, filePath, NodeType_1.EntityType.MODULE, []).then(function (moduleNode) { return __awaiter(_this, void 0, void 0, function () {
                                var fileNode;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.neoGraph.getNodeWithPath(fileName, filePath)];
                                        case 1:
                                            fileNode = _a.sent();
                                            if (!(fileNode !== undefined)) return [3 /*break*/, 3];
                                            return [4 /*yield*/, this.neoGraph.linkTwoNodes(fileNode, moduleNode, relationType)];
                                        case 2: return [2 /*return*/, _a.sent()];
                                        case 3:
                                            console.log("Error to link nodes " + name + " and " + /*className*/ fileName + "...");
                                            _a.label = 4;
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return ClassesVisitor;
}(SymfinderVisitor_1.default));
exports.default = ClassesVisitor;
