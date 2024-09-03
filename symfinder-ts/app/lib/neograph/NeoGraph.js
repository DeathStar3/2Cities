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
var fs_1 = require("fs");
var neo4j_driver_1 = require("neo4j-driver");
var neo4j_driver_core_1 = require("neo4j-driver-core");
var process_1 = require("process");
var NodeType_1 = require("./NodeType");
var NeoGraph = /** @class */ (function () {
    function NeoGraph(config) {
        this.driver = (0, neo4j_driver_1.driver)(config.getNeo4JBoltAdress(), neo4j_driver_core_1.auth.basic('neo4j', 'root'), { disableLosslessIntegers: true });
    }
    NeoGraph.prototype.createNode = function (name, type, types) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                types.push(type);
                request = "CREATE (n:" + types.join(':') + " { name: $name}) RETURN (n)";
                return [2 /*return*/, this.submitRequest(request, { name: name }).then(function (result) {
                        return (result[0].get(0));
                    })];
            });
        });
    };
    NeoGraph.prototype.createNodeWithPath = function (name, path, type, types) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                types.push(type);
                request = "CREATE (n:" + types.join(':') + " { name:$name, path:$path }) RETURN (n)";
                return [2 /*return*/, this.submitRequest(request, { name: name, path: path }).then(function (result) {
                        return (result[0].get(0));
                    })];
            });
        });
    };
    NeoGraph.prototype.changeInternalLinkToExport = function (name, path) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = "MATCH (n {name: $name})<-[i:INTERNAL]-(f:FILE {path: $path}) WITH n,i,f ORDER BY id(n) DESC LIMIT 1 CREATE (n)<-[:EXPORT]-(f) DELETE i";
                        //on prend celui avec le plus grand Id car il se peut qu'un fichier a plusieurs class/interface avec le même nom mais seulement la dernière est exportée
                        return [4 /*yield*/, this.submitRequest(request, { name: name, path: path })];
                    case 1:
                        //on prend celui avec le plus grand Id car il se peut qu'un fichier a plusieurs class/interface avec le même nom mais seulement la dernière est exportée
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NeoGraph.prototype.getOrCreateNode = function (name, type, createAttributes, matchAttributes) {
        return __awaiter(this, void 0, void 0, function () {
            var onCreateAttributes, onMatchAttributes, request;
            return __generator(this, function (_a) {
                onCreateAttributes = createAttributes.length == 0 ? "" : "ON CREATE SET n:" + createAttributes.join(':');
                onMatchAttributes = matchAttributes.length == 0 ? "" : "ON MATCH SET n:" + matchAttributes.join(":");
                request = "MERGE (n:" + type + " {name: $name}) " + onCreateAttributes + " " + onMatchAttributes + " RETURN (n)";
                return [2 /*return*/, this.submitRequest(request, { name: name }).then(function (result) {
                        return (result[0].get(0));
                    })];
            });
        });
    };
    NeoGraph.prototype.getOrCreateNodeWithPath = function (name, path, type, createAttributes, matchAttributes) {
        return __awaiter(this, void 0, void 0, function () {
            var onCreateAttributes, onMatchAttributes, request;
            return __generator(this, function (_a) {
                onCreateAttributes = createAttributes.length == 0 ? "" : "ON CREATE SET n:" + createAttributes.join(':');
                onMatchAttributes = matchAttributes.length == 0 ? "" : "ON MATCH SET n:" + matchAttributes.join(":");
                request = "MERGE (n:" + type + " {name: $name, path: $path}) " + onCreateAttributes + " " + onMatchAttributes + " RETURN (n)";
                return [2 /*return*/, this.submitRequest(request, { name: name, path: path }).then(function (result) {
                        return (result[0].get(0));
                    })];
            });
        });
    };
    NeoGraph.prototype.getNode = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = "MATCH (n {name: $name}) RETURN (n)";
                return [2 /*return*/, this.submitRequest(request, { name: name }).then(function (result) {
                        return result[0] ? (result[0].get(0)) : undefined;
                    })];
            });
        });
    };
    NeoGraph.prototype.getAllNodes = function (path, relationship) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = "MATCH (:FILE {path: $path})-[:" + relationship + "]->(n) RETURN (n)";
                return [2 /*return*/, this.submitRequest(request, { path: path }).then(function (result) {
                        return result.map(function (value) { return value.get(0); });
                    })];
            });
        });
    };
    /*async getNodeWithClass(name: string, className: string): Promise<Node | undefined>{
        const request = "MATCH (n {name: $name})<--(m:CLASS {name: $className}) RETURN (n)";

        return this.submitRequest(request, {name:name, className:className}).then((result: Record[]) =>{
            return result[0] ? <Node>(result[0].get(0)) : undefined;
        });
    }*/
    NeoGraph.prototype.getNodeWithFile = function (name, path) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = "MATCH (n)<-[r]-(m {path: $path}) WHERE n.name = $name or r.alt_name = $name RETURN (n)";
                return [2 /*return*/, this.submitRequest(request, { name: name, path: path }).then(function (result) {
                        return result[0] ? (result[0].get(0)) : undefined;
                    })];
            });
        });
    };
    NeoGraph.prototype.getElementNodeWithFile = function (name, type, path) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = "MATCH (n:" + type + ")<--(m {path: $path}) WHERE n.name = $name OR n.alt_name = $name RETURN (n)";
                return [2 /*return*/, this.submitRequest(request, { name: name, path: path }).then(function (result) {
                        return result[0] ? (result[0].get(0)) : undefined;
                    })];
            });
        });
    };
    NeoGraph.prototype.getClassNodeWithPath = function (className, path) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = "MATCH (n {name: $name})<-[:EXPORT|INTERNAL]-(m {path: $path}) RETURN (n)";
                return [2 /*return*/, this.submitRequest(request, { name: className, path: path }).then(function (result) {
                        return result[0] ? (result[0].get(0)) : undefined;
                    })];
            });
        });
    };
    NeoGraph.prototype.getClassNodeByModuleIfUnique = function (className, moduleName) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = "MATCH (m:MODULE {name: $moduleName}) WITH m.path AS Mpath MATCH (n {name: $className}) <-[:EXPORT|INTERNAL]-(o {path: Mpath}) RETURN (n)";
                return [2 /*return*/, this.submitRequest(request, { className: className, moduleName: moduleName }).then(function (result) {
                        return result.length === 1 ? (result[0].get(0)) : undefined;
                    })];
            });
        });
    };
    NeoGraph.prototype.getClassNodeByModule = function (className, moduleName, path) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = "MATCH (:MODULE {name: $moduleName, path: $path})<-[:EXPORT|INTERNAL]-(:FILE)-[:EXPORT|INTERNAL]->(n {name: $className}) WHERE NOT n:MODULE RETURN (n)";
                return [2 /*return*/, this.submitRequest(request, { className: className, moduleName: moduleName, path: path }).then(function (result) {
                        return result.length === 1 ? (result[0].get(0)) : undefined;
                    })];
            });
        });
    };
    NeoGraph.prototype.getNodeWithPath = function (name, path) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = "MATCH (n {name:$name, path:$path}) RETURN (n)";
                return [2 /*return*/, this.submitRequest(request, { name: name, path: path }).then(function (result) {
                        return result[0] ? (result[0].get(0)) : undefined;
                    })];
            });
        });
    };
    NeoGraph.prototype.getNodeWithType = function (name, type) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = "MATCH (n:" + type + " {name: $name}) RETURN (n)";
                return [2 /*return*/, this.submitRequest(request, { name: name }).then(function (result) {
                        return result[0] ? (result[0].get(0)) : undefined;
                    })];
            });
        });
    };
    NeoGraph.prototype.getClassNodeWithImport = function (className, filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = "MATCH (:FILE {path: $path})-[:IMPORT]->(n {name: $name})<-[:EXPORT]-(:FILE) RETURN n";
                return [2 /*return*/, this.submitRequest(request, { name: className, path: filePath }).then(function (result) {
                        return result[0] ? (result[0].get(0)) : undefined;
                    })];
            });
        });
    };
    NeoGraph.prototype.getClassNodeIfUnique = function (className) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = "MATCH (n {name: $name})<-[:EXPORT|INTERNAL]-(f) RETURN (n)";
                return [2 /*return*/, this.submitRequest(request, { name: className }).then(function (result) {
                        return result.length == 1 ? (result[0].get(0)) : undefined;
                    })];
            });
        });
    };
    NeoGraph.prototype.getNodeByClass = function (name, filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = "MATCH (n {name: $name})<--(:CLASS)<--(:FILE {path: $path}) RETURN (n)";
                return [2 /*return*/, this.submitRequest(request, { name: name, path: filePath }).then(function (result) {
                        return result.length == 1 ? (result[0].get(0)) : undefined;
                    })];
            });
        });
    };
    NeoGraph.prototype.linkTwoNodes = function (node1, node2, type) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = "MATCH(a)\n" +
                            "WHERE ID(a)=$aId\n" +
                            "WITH a\n" +
                            "MATCH (b)\n" +
                            "WITH a,b\n" +
                            "WHERE ID(b)=$bId\n" +
                            "MERGE (a)-[r:" + type + "]->(b)";
                        return [4 /*yield*/, this.submitRequest(request, { aId: node1.identity, bId: node2.identity })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NeoGraph.prototype.linkTwoNodesWithCodeDuplicated = function (node1, node2, type, percent, lines) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = "MATCH(a)\n" +
                            "WHERE ID(a)=$aId\n" +
                            "WITH a\n" +
                            "MATCH (b)\n" +
                            "WITH a,b\n" +
                            "WHERE ID(b)=$bId\n" +
                            "CREATE (a)-[r:" + type + " {codePercent: $percent, lines: $lines}]->(b)";
                        return [4 /*yield*/, this.submitRequest(request, { aId: node1.identity, bId: node2.identity, percent: percent, lines: lines })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NeoGraph.prototype.updateLinkTwoNode = function (node1, node2, oldType, newType) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = "MATCH(a)\n" +
                            "WHERE ID(a)=$aId\n" +
                            "WITH a\n" +
                            "MATCH (b)\n" +
                            "WITH a,b\n" +
                            "WHERE ID(b)=$bId\n" +
                            "MATCH(a)-[r1:" + oldType + "]->(b)\n" +
                            "DELETE r1\n" +
                            "CREATE (a)-[r2:" + newType + "]->(b)";
                        return [4 /*yield*/, this.submitRequest(request, { aId: node1.identity, bId: node2.identity })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NeoGraph.prototype.setAlternativeName = function (fileNode, node, name) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = "MATCH (f)-[e:EXPORT]->(n)\n" +
                            "WHERE ID(f) = $fileId and ID(n) = $id\n" +
                            "SET e.alt_name = $name\n" +
                            "RETURN n";
                        return [4 /*yield*/, this.submitRequest(request, { fileId: fileNode.identity, id: node.identity, name: name }).then(function (result) {
                                return result[0] ? (result[0].get(0)) : undefined;
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    NeoGraph.prototype.getNbVariant = function (node) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = "MATCH (c)-[:EXTENDS|IMPLEMENTS]->(c2:CLASS) " +
                    "WHERE ID(c) = $id " +
                    "RETURN count(c2)";
                return [2 /*return*/, this.submitRequest(request, { id: node.identity }).then(function (result) {
                        return +(result[0].get(0));
                    })];
            });
        });
    };
    NeoGraph.prototype.addLabelToNode = function (node, label) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = "MATCH (n) WHERE ID(n) = $id SET n:" + label + " RETURN (n)";
                return [2 /*return*/, this.submitRequest(request, { id: node.identity }).then(function (result) {
                        return;
                    })];
            });
        });
    };
    NeoGraph.prototype.detectVPsAndVariants = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.setMethodVPs()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.setMethodVariants()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.setConstructorVPs()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.setConstructorVariants()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.setNbVariantsProperty()];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.setVPLabels()];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this.setMethodLevelVPLabels()];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, this.setVariantsLabels()];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, this.setPublicMethods()];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, this.setPublicConstructors()];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, this.setNbCompositions()];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, this.setAllMethods()];
                    case 12:
                        _a.sent();
                        return [4 /*yield*/, this.detectStrategiesWithComposition()];
                    case 13:
                        _a.sent();
                        return [4 /*yield*/, this.detectDensity()];
                    case 14:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NeoGraph.prototype.setMethodVPs = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.submitRequest("MATCH (c:CLASS)-->(a:METHOD) MATCH (c:CLASS)-->(b:METHOD)\n" +
                            "WHERE a.name = b.name AND ID(a) <> ID(b)\n" +
                            "WITH count(DISTINCT a.name) AS cnt, c\n" +
                            "SET c.methodVPs = cnt", {})];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.submitRequest("MATCH (c:CLASS)\n" +
                                "WHERE NOT EXISTS(c.methodVPs)\n" +
                                "SET c.methodVPs = 0", {})];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NeoGraph.prototype.setMethodVariants = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.submitRequest("MATCH (c:CLASS)-->(a:METHOD) MATCH (c:CLASS)-->(b:METHOD)\n" +
                            "WHERE a.name = b.name AND ID(a) <> ID(b)\n" +
                            "WITH count(DISTINCT a) AS cnt, c\n" +
                            "SET c.methodVariants = cnt - 1", {})];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.submitRequest("MATCH (c:CLASS)\n" +
                                "WHERE NOT EXISTS(c.methodVariants)\n" +
                                "SET c.methodVariants = 0", {})];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NeoGraph.prototype.setConstructorVPs = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.submitRequest("MATCH (c:CLASS)-->(a:CONSTRUCTOR)\n" +
                            "WITH count(a.name) AS cnt, c\n" +
                            "SET c.constructorVPs = CASE WHEN cnt > 1 THEN 1 ELSE 0 END", {})];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.submitRequest("MATCH (c:CLASS)\n" +
                                "WHERE NOT EXISTS(c.constructorVPs)\n" +
                                "SET c.constructorVPs = 0", {})];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NeoGraph.prototype.setConstructorVariants = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.submitRequest("MATCH (c:CLASS)-->(a:CONSTRUCTOR)\n" +
                            "WITH count(a.name) AS cnt, c\n" +
                            "SET c.constructorVariants = CASE WHEN cnt > 1 THEN cnt ELSE 0 END", {})];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.submitRequest("MATCH (c:CLASS)\n" +
                                "WHERE NOT EXISTS(c.constructorVariants)\n" +
                                "SET c.constructorVariants = 0", {})];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NeoGraph.prototype.setNbVariantsProperty = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.submitRequest("MATCH (c)-[:EXTENDS|IMPLEMENTS]->(sc:CLASS) WITH count(sc) AS nbVar, c SET c.classVariants = nbVar", {})];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.submitRequest("MATCH (c) WHERE ((c:CLASS OR c:INTERFACE) AND NOT EXISTS (c.classVariants)) SET c.classVariants = 0", {})];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NeoGraph.prototype.setVPLabels = function () {
        return __awaiter(this, void 0, void 0, function () {
            var clauseForHavingDesignPattern, request;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        clauseForHavingDesignPattern = Object.keys(NodeType_1.DesignPatternType).map(function (nodeType) { return "c:" + nodeType; }).join(" OR ");
                        request = "MATCH (c) WHERE (NOT c:OUT_OF_SCOPE)\n"
                            + "AND (c:INTERFACE OR (c:CLASS AND c:ABSTRACT) OR (" + clauseForHavingDesignPattern + ") OR (EXISTS(c.classVariants) AND c.classVariants > 0))\n"
                            + "SET c:" + NodeType_1.EntityAttribut.VP;
                        return [4 /*yield*/, this.submitRequest(request, {})];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NeoGraph.prototype.setMethodLevelVPLabels = function () {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = "MATCH (c) WHERE (NOT c:OUT_OF_SCOPE) AND (c.methodVPs > 0 OR c.constructorVPs > 0) SET c:" + NodeType_1.EntityAttribut.METHOD_LEVEL_VP;
                        return [4 /*yield*/, this.submitRequest(request, {})];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NeoGraph.prototype.setVariantsLabels = function () {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = "MATCH (sc:VP)-[:EXTENDS|IMPLEMENTS]->(c) WHERE c:CLASS OR c:INTERFACE SET c:" + NodeType_1.EntityAttribut.VARIANT;
                        return [4 /*yield*/, this.submitRequest(request, {})];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NeoGraph.prototype.setPublicMethods = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.submitRequest("MATCH (c:CLASS:PUBLIC)-->(a:METHOD:PUBLIC)\n" +
                            "WITH count( a.name ) AS cnt, c\n" +
                            "SET c.publicMethods = cnt", {})];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.submitRequest("MATCH (c:CLASS)\n" +
                                "WHERE NOT EXISTS(c.publicMethods)\n" +
                                "SET c.publicMethods = 0", {})];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NeoGraph.prototype.setPublicConstructors = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.submitRequest("MATCH (c)-->(a) \n" +
                            "WHERE c:PUBLIC AND c:CLASS AND  a:CONSTRUCTOR AND a:PUBLIC\n" +
                            "WITH count( a.name ) AS cnt, c\n" +
                            "SET c.publicConstructors = cnt", {})];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.submitRequest("MATCH (c:CLASS)\n" +
                                "WHERE NOT EXISTS(c.publicConstructors)\n" +
                                "SET c.publicConstructors = 0", {})];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NeoGraph.prototype.setNbCompositions = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.submitRequest("MATCH (c)-[:INSTANTIATE]->(a) WITH count(a) AS nbComp, c SET c.nbCompositions = nbComp", {})];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NeoGraph.prototype.setAllMethods = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.submitRequest("MATCH (c:CLASS)-->(a:METHOD)\n" +
                            "WITH count( a.name ) AS cnt, c\n" +
                            "SET c.allMethods = cnt", {})];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.submitRequest("MATCH (c:CLASS)\n" +
                                "WHERE NOT EXISTS(c.allMethods)\n" +
                                "SET c.allMethods = 0", {})];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // async setModuleVP(): Promise<void>{
    //     const request = "MATCH (c1:CLASS) MATCH (c2:CLASS)\n"+
    //     "WHERE c1.name = c2.name\n" +
    //     "AND ID(c1)<>ID(c2)\n" +
    //     "SET c1:"+EntityAttribut.MODULE_VP+"\n" +
    //     "SET c2:"+EntityAttribut.MODULE_VP;
    //     await this.submitRequest(request,{});
    // }
    // async setModuleVariant(): Promise<void>{
    //     const request = "MATCH (m:MODULE)-[:EXPORT]->(c:MODULE_VP) SET m:"+EntityAttribut.MODULE_VARIANT;
    //     await this.submitRequest(request, {});
    // }
    NeoGraph.prototype.setProximityFolder = function () {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = "MATCH (n:DIRECTORY)-[:CHILD]->(d1:DIRECTORY)-[:CHILD]->(f1:FILE), (n:DIRECTORY)-[:CHILD]->(d2:DIRECTORY)-[:CHILD]->(f2:FILE)\n" +
                            "WHERE ID(f1)<>ID(f2)\n" +
                            "AND ID(d1)<>ID(d2)\n" +
                            "AND f1.name = f2.name\n" +
                            "AND f1.name <> $index\n" +
                            "AND f1.name <> $utils\n" +
                            "AND f1.name <> $types\n" +
                            "SET n:" + NodeType_1.EntityAttribut.VP_FOLDER + "\n" +
                            "SET d1:" + NodeType_1.EntityAttribut.VARIANT_FOLDER + "\n" +
                            "SET f1:" + NodeType_1.EntityAttribut.VARIANT_FILE + "\n";
                        return [4 /*yield*/, this.submitRequest(request, { index: "index.ts", utils: "utils.ts", types: 'types.ts' })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NeoGraph.prototype.detectStrategiesWithComposition = function () {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = "MATCH (c)-[:INSTANTIATE]->(c1) " +
                            "WHERE (c:CLASS OR c:INTERFACE) AND (EXISTS(c1.classVariants) AND c1.classVariants > 1) " +
                            "SET c1:" + NodeType_1.DesignPatternType.COMPOSITION_STRATEGY;
                        return [4 /*yield*/, this.submitRequest(request, {})];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NeoGraph.prototype.detectDensity = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.submitRequest("MATCH (v1:VARIANT)-[:INSTANTIATE]->(v2:VARIANT) " +
                            "SET v1:DENSE SET v2:DENSE", {})];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NeoGraph.prototype.getTotalNbVPs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getNbClassLevelVPs()];
                    case 1:
                        _a = (_b.sent());
                        return [4 /*yield*/, this.getNbMethodLevelVPs()];
                    case 2: return [2 /*return*/, _a + (_b.sent())];
                }
            });
        });
    };
    NeoGraph.prototype.getNbClassLevelVPs = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.submitRequest("MATCH (c:VP) RETURN COUNT (DISTINCT c)", {}).then(function (result) {
                        return +(result[0].get(0));
                    })];
            });
        });
    };
    NeoGraph.prototype.getNbMethodLevelVPs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getNbMethodVPs()];
                    case 1:
                        _a = (_b.sent());
                        return [4 /*yield*/, this.getNbConstructorVPs()];
                    case 2: return [2 /*return*/, _a + (_b.sent())];
                }
            });
        });
    };
    NeoGraph.prototype.getNbMethodVPs = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.submitRequest("MATCH (c:CLASS) RETURN (SUM(c.methodVPs))", {}).then(function (result) {
                        return +(result[0].get(0));
                    })];
            });
        });
    };
    NeoGraph.prototype.getNbConstructorVPs = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.submitRequest("MATCH (c:CLASS) RETURN (SUM(c.constructorVPs))", {}).then(function (result) {
                        return +(result[0].get(0));
                    })];
            });
        });
    };
    NeoGraph.prototype.getTotalNbVariants = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getNbClassLevelVariants()];
                    case 1:
                        _a = (_b.sent());
                        return [4 /*yield*/, this.getNbMethodLevelVariants()];
                    case 2: return [2 /*return*/, _a + (_b.sent())];
                }
            });
        });
    };
    NeoGraph.prototype.getNbClassLevelVariants = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.submitRequest("MATCH (c:VARIANT) WHERE NOT c:VP RETURN (COUNT(DISTINCT c))", {}).then(function (result) {
                        return +(result[0].get(0));
                    })];
            });
        });
    };
    NeoGraph.prototype.getNbMethodLevelVariants = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getNbMethodVariants()];
                    case 1:
                        _a = (_b.sent());
                        return [4 /*yield*/, this.getNbConstructorVariants()];
                    case 2: return [2 /*return*/, _a + (_b.sent())];
                }
            });
        });
    };
    NeoGraph.prototype.getNbMethodVariants = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.submitRequest("MATCH (c:CLASS) RETURN (SUM(c.methodVariants))", {}).then(function (result) {
                        return +(result[0].get(0));
                    })];
            });
        });
    };
    NeoGraph.prototype.getNbConstructorVariants = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.submitRequest("MATCH (c:CLASS) RETURN (SUM(c.constructorVariants))", {}).then(function (result) {
                        return +(result[0].get(0));
                    })];
            });
        });
    };
    NeoGraph.prototype.getNbNodes = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.submitRequest("MATCH(n) RETURN count(*)", {}).then(function (result) {
                        return +(result[0].get(0));
                    })];
            });
        });
    };
    NeoGraph.prototype.getNbRelationships = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.submitRequest("MATCH (n)-[r]->() RETURN COUNT(r)", {}).then(function (result) {
                        return +(result[0].get(0));
                    })];
            });
        });
    };
    NeoGraph.prototype.getNbVPFolders = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.submitRequest("MATCH (d:VP_FOLDER) RETURN (COUNT(DISTINCT d))", {}).then(function (result) {
                        return +(result[0].get(0));
                    })];
            });
        });
    };
    NeoGraph.prototype.getNbVariantFolders = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.submitRequest("MATCH (d:VARIANT_FOLDER) RETURN (COUNT(DISTINCT d))", {}).then(function (result) {
                        return +(result[0].get(0));
                    })];
            });
        });
    };
    NeoGraph.prototype.getNbVariantFiles = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.submitRequest("MATCH (d:VARIANT_FILE) RETURN (COUNT(DISTINCT d))", {}).then(function (result) {
                        return +(result[0].get(0));
                    })];
            });
        });
    };
    NeoGraph.prototype.getNbCoreFiles = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.submitRequest("MATCH (d:CORE_FILE) RETURN (COUNT(DISTINCT d))", {}).then(function (result) {
                        return +(result[0].get(0));
                    })];
            });
        });
    };
    NeoGraph.prototype.getNbProximityEntity = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.submitRequest("MATCH (d:PROXIMITY_ENTITY) RETURN (COUNT(DISTINCT d))", {}).then(function (result) {
                        return +(result[0].get(0));
                    })];
            });
        });
    };
    NeoGraph.prototype.getAllVariantFiles = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.submitRequest("MATCH (n:" + NodeType_1.EntityAttribut.VARIANT_FILE + ") RETURN n", {}).then(function (results) {
                        return (results.map(function (result) { return result.get(0); }));
                    })];
            });
        });
    };
    NeoGraph.prototype.getAllFiles = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.submitRequest("MATCH (n:" + NodeType_1.EntityType.FILE + ") RETURN n", {}).then(function (results) {
                        return (results.map(function (result) { return result.get(0); }));
                    })];
            });
        });
    };
    NeoGraph.prototype.getAllClass = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.submitRequest("MATCH (n:" + NodeType_1.EntityType.CLASS + ") RETURN n", {}).then(function (results) {
                        return (results.map(function (result) { return result.get(0); }));
                    })];
            });
        });
    };
    NeoGraph.prototype.getNbExportRelationships = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.submitRequest("MATCH (n)-[r:EXPORT]->() RETURN COUNT(r)", {}).then(function (result) {
                        return +(result[0].get(0));
                    })];
            });
        });
    };
    NeoGraph.prototype.getAllVPFoldersPath = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.submitRequest("MATCH (n:" + NodeType_1.EntityAttribut.VP_FOLDER + ") RETURN n.path", {}).then(function (results) {
                        return (results.map(function (result) { return result.get(0); }));
                    })];
            });
        });
    };
    NeoGraph.prototype.getFoldersPathForVPFolderPath = function (vpFolderPath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.submitRequest("MATCH (n:" + NodeType_1.EntityAttribut.VP_FOLDER + ")-[:" + NodeType_1.RelationType.CHILD + "]->(d:" + NodeType_1.EntityType.DIRECTORY + ")\n" +
                        "WHERE n.path = $path RETURN d.path", { path: vpFolderPath }).then(function (results) {
                        return (results.map(function (result) { return result.get(0); }));
                    })];
            });
        });
    };
    NeoGraph.prototype.getVariantFilesNameForVPFolderPath = function (vpFolderPath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.submitRequest("MATCH (n:" + NodeType_1.EntityAttribut.VP_FOLDER + ")-[:" + NodeType_1.RelationType.CHILD + "]->(d:" + NodeType_1.EntityAttribut.VARIANT_FOLDER + ")-[:" + NodeType_1.RelationType.CHILD + "]->(f:" + NodeType_1.EntityAttribut.VARIANT_FILE + ")\n" +
                        "WHERE n.path = $path\n" +
                        "RETURN DISTINCT f.name", { path: vpFolderPath }).then(function (results) {
                        return (results.map(function (result) { return result.get(0); }));
                    })];
            });
        });
    };
    NeoGraph.prototype.getVariantFilesForVPFolderPath = function (vpFolderPath, variantFileName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.submitRequest("MATCH (n:" + NodeType_1.EntityAttribut.VP_FOLDER + ")-[:" + NodeType_1.RelationType.CHILD + "]->(d:" + NodeType_1.EntityAttribut.VARIANT_FOLDER + ")-[:" + NodeType_1.RelationType.CHILD + "]->(f:" + NodeType_1.EntityAttribut.VARIANT_FILE + ")\n" +
                        "WHERE n.path = $path\n" +
                        "AND f.name = $name\n" +
                        "RETURN f", { path: vpFolderPath, name: variantFileName }).then(function (results) {
                        return (results.map(function (result) { return result.get(0); }));
                    })];
            });
        });
    };
    NeoGraph.prototype.getVariantFileForFolderPath = function (folderPath, variantFileName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.submitRequest("MATCH (d:" + NodeType_1.EntityType.DIRECTORY + ")-[:" + NodeType_1.RelationType.CHILD + "]->(f:" + NodeType_1.EntityAttribut.VARIANT_FILE + ")\n" +
                        "WHERE d.path = $folderPath AND f.name = $variantFileName RETURN f", { folderPath: folderPath, variantFileName: variantFileName })
                        .then(function (results) {
                        return results[0] ? (results[0].get(0)) : undefined;
                    })];
            });
        });
    };
    NeoGraph.prototype.getVariantEntityNodeForFileNode = function (fileNode) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = "MATCH (f:" + NodeType_1.EntityType.FILE + ")-[]->(e)\n" +
                    "WHERE (e:" + NodeType_1.EntityType.CLASS + " or e:" + NodeType_1.EntityType.FUNCTION + " or e:" + NodeType_1.EntityType.VARIABLE + ")\n" +
                    "AND ID(f) = $id\n" +
                    "RETURN e";
                return [2 /*return*/, this.submitRequest(request, { id: fileNode.identity }).then(function (results) {
                        return (results.map(function (result) { return result.get(0); }));
                    })];
            });
        });
    };
    NeoGraph.prototype.getMotherEntitiesNode = function () {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = "MATCH (e)-[r:" + NodeType_1.RelationType.EXTENDS + "|" + NodeType_1.RelationType.IMPLEMENTS + "]->(c:CLASS)\n" +
                    "WHERE e:" + NodeType_1.EntityType.CLASS + " or e:" + NodeType_1.EntityType.INTERFACE + "\n" +
                    "RETURN DISTINCT e";
                return [2 /*return*/, this.submitRequest(request, {}).then(function (results) {
                        return (results.map(function (result) { return result.get(0); }));
                    })];
            });
        });
    };
    NeoGraph.prototype.getImplementedClassesFromEntity = function (entity) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = "MATCH (n)-[r:" + NodeType_1.RelationType.EXTENDS + "|" + NodeType_1.RelationType.IMPLEMENTS + "]->(c) WHERE ID(n) = $id RETURN c";
                return [2 /*return*/, this.submitRequest(request, { id: entity.identity }).then(function (results) {
                        return (results.map(function (result) { return result.get(0); }));
                    })];
            });
        });
    };
    NeoGraph.prototype.getMethods = function (entity) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = "MATCH (e)-[r:" + NodeType_1.RelationType.METHOD + "]->(m:" + NodeType_1.EntityType.METHOD + ") WHERE ID(e) = $id RETURN m";
                return [2 /*return*/, this.submitRequest(request, { id: entity.identity }).then(function (results) {
                        return (results.map(function (result) { return result.get(0); }));
                    })];
            });
        });
    };
    NeoGraph.prototype.exportToJSON = function () {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = "MATCH (n) WHERE n:VP_FOLDER OR n:VARIANT_FOLDER OR n:DIRECTORY OR n:VARIANT_FILE OR n:CORE_FILE OR n:FILE RETURN collect({types:labels(n), name:n.name})";
                return [2 /*return*/, this.submitRequest(request, {}).then(function (results) {
                        var data = results.map(function (result) { return result.get(0); });
                        var content = JSON.stringify(data);
                        (0, fs_1.writeFile)('./export/db.json', content, function (err) {
                            if (err)
                                throw err;
                            process.stdout.write('data written to file');
                        });
                        return data;
                    })];
            });
        });
    };
    NeoGraph.prototype.exportRelationJSON = function (src) {
        return __awaiter(this, void 0, void 0, function () {
            function replaceLinkPrefix(link) {
                if (link.source.startsWith('..')) {
                    link.source = './' + link.source.split('/').slice(2).join('/');
                }
                if (link.target.startsWith('..')) {
                    link.target = './' + link.target.split('/').slice(2).join('/');
                }
            }
            var requestLinks, duplicationLinksRequest, classRequest, fileRequest, linksComposeRequest, allLinks, data, content, projectName;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        requestLinks = "match (n)-[r]->(m) where (type(r) = 'EXPORT' or type(r) = 'IMPLEMENTS' or type(r) = 'EXTENDS'" +
                            " or type(r) = 'IMPORT' or type(r) = 'LOAD' or type(r) = 'CHILD'  or type(r) = 'CORE_CONTENT' or type(r) = 'CODE_CLONE')" +
                            " and not ('OUT_OF_SCOPE' in labels(m)) and not ('OUT_OF_SCOPE' in labels(n)) and not ('VARIABLE' in labels (m)) and not ('FUNCTION' in labels(m))" +
                            "with CASE when m.path IS NULL then m.name else m.path end as mname, CASE " +
                            "when n.path IS NULL then n.name else n.path end as nname,r with collect " +
                            "({source:nname,target:mname,type:type(r)}) as rela return {links:rela}";
                        duplicationLinksRequest = "match (n)-[r]->(m) where type(r) = 'CODE_CLONE'  or type(r) = 'CORE_CONTENT' and not ('OUT_OF_SCOPE' in labels(m)) and not ('OUT_OF_SCOPE' in labels(n)) " +
                            "with CASE when m.path IS NULL then m.name else m.path end as mname, CASE when n.path IS NULL then n.name else n.path end as nname,r " +
                            " with collect ({source:nname,target:mname,percentage: r.codePercent, type:type(r)}) as rela return {links:rela} ";
                        classRequest = "MATCH (n) where ('CLASS' in labels(n) or 'INTERFACE' in labels(n)) and not ('BASE' in labels(n)) " +
                            "with collect({types:labels(n), name:n.name, constructorVPs:n.constructorVPs," +
                            "publicConstructors:n.publicConstructors, methodVariants:n.methodVariants, classVariants:n.classVariants," +
                            "publicMethods:n.publicMethods, methodVPs:n.methodVPs}) as m return {nodes:m}";
                        fileRequest = "MATCH (n) WHERE (n:VP_FOLDER OR n:VARIANT_FOLDER OR n:DIRECTORY OR n:VARIANT_FILE OR n:CORE_FILE OR n:FILE) " +
                            "and not ('BASE' in labels(n)) with " +
                            "collect({types:labels(n), name:n.path, constructorVPs:n.constructorVPs," +
                            "publicConstructors:n.publicConstructors, methodVariants:n.methodVariants, classVariants:n.classVariants," +
                            "publicMethods:n.publicMethods, methodVPs:n.methodVPs}) as m return {nodes:m}";
                        linksComposeRequest = "MATCH (f:FILE) -[r]-> (n)-[:TYPE_OF]->(m:CLASS)<-[:EXPORT]-(fe:FILE) " +
                            "WHERE 'PROPERTY' in labels(n) or 'PARAMETER' in labels(n) or 'VARIABLE' in labels(n) " +
                            "WITH collect ( distinct {source:f.path,target:fe.path,type:'USAGE'}) as rela " +
                            "RETURN {linkscompose:rela} ";
                        allLinks = "match (n)-[r]->(m) where (type(r) = 'EXPORT' or type(r) = 'IMPLEMENTS' or type(r) = 'EXTENDS'" +
                            " or type(r) = 'IMPORT' or type(r) = 'LOAD' or type(r) = 'CHILD'  or type(r) = 'CORE_CONTENT' or type(r) = 'CODE_CLONE')" +
                            " and not ('OUT_OF_SCOPE' in labels(m)  or 'FUNCTION' in labels(m) or 'VARIABLE' in labels(m) or 'PROPERTY' in labels(m)) and not ('OUT_OF_SCOPE' in labels(n) or 'FUNCTION' in labels(n) " +
                            "or 'VARIABLE' in labels(n) or 'PROPERTY' in labels(n)) with CASE when m.path IS NULL then m.name else m.path end as mname, CASE " +
                            "when n.path IS NULL then n.name else n.path end as nname,r with collect " +
                            "({source:nname,target:mname,type:type(r)}) as rela return {links:rela}";
                        data = { links: [], nodes: [], alllinks: [], allnodes: [], linkscompose: [] };
                        return [4 /*yield*/, this.submitRequest(duplicationLinksRequest, {}).then(function (results) {
                                data.links = results.map(function (result) { return result.get(0); })[0].links;
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.submitRequest(requestLinks, {}).then(function (results) {
                                data.links.push.apply(data.links, results.map(function (result) { return result.get(0); })[0].links);
                            })];
                    case 2:
                        _a.sent();
                        data.links.map(function (link) {
                            if (link.source.startsWith('..')) {
                                link.source = './' + link.source.split('/').slice(2).join('/');
                            }
                            if (link.target.startsWith('..')) {
                                link.target = './' + link.target.split('/').slice(2).join('/');
                            }
                        });
                        return [4 /*yield*/, this.submitRequest(fileRequest, {}).then(function (results) {
                                data.nodes = results.map(function (result) { return result.get(0); })[0].nodes;
                            })];
                    case 3:
                        _a.sent();
                        data.nodes.map(function (node) {
                            if (node.name.startsWith('..')) {
                                node.name = './' + node.name.split('/').slice(2).join('/');
                            }
                        });
                        return [4 /*yield*/, this.submitRequest(classRequest, {}).then(function (results) {
                                data.nodes.push.apply(data.nodes, results.map(function (result) { return result.get(0); })[0].nodes);
                            })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.submitRequest(linksComposeRequest, {}).then(function (results) {
                                data.linkscompose = results.map(function (result) { return result.get(0); })[0].linkscompose;
                            })];
                    case 5:
                        _a.sent();
                        data.linkscompose.map(function (linkscompose) {
                            if (linkscompose.source.startsWith('..')) {
                                linkscompose.source = './' + linkscompose.source.split('/').slice(2).join('/');
                            }
                            if (linkscompose.target.startsWith('..')) {
                                linkscompose.target = './' + linkscompose.target.split('/').slice(2).join('/');
                            }
                        });
                        return [4 /*yield*/, this.submitRequest(allLinks, {}).then(function (results) {
                                data.alllinks = results.map(function (result) { return result.get(0); })[0].links;
                            })];
                    case 6:
                        _a.sent();
                        data.alllinks.push.apply(data.alllinks, data.linkscompose);
                        data.links.map(function (link) {
                            replaceLinkPrefix(link);
                        });
                        data.alllinks.map(function (link) {
                            replaceLinkPrefix(link);
                        });
                        content = JSON.stringify(data);
                        projectName = src.split("/").pop();
                        (0, fs_1.writeFile)('./export/' + projectName + '.json', content, function (err) {
                            if (err)
                                throw err;
                            process.stdout.write('data written to file');
                        });
                        return [2 /*return*/, content];
                }
            });
        });
    };
    NeoGraph.prototype.clearNodes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = "MATCH (n) WHERE NOT (n:BASE) DETACH DELETE n";
                        return [4 /*yield*/, this.submitRequest(request, {})];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NeoGraph.prototype.markNodesAsBase = function () {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = "MATCH (n) SET n:BASE";
                        return [4 /*yield*/, this.submitRequest(request, {})];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NeoGraph.prototype.submitRequest = function (request, parameter) {
        return __awaiter(this, void 0, void 0, function () {
            var maxTry, waitingTime, nbTry, session, transaction, result, Error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        maxTry = 10;
                        waitingTime = 5;
                        nbTry = 0;
                        _a.label = 1;
                    case 1:
                        if (!(nbTry < maxTry)) return [3 /*break*/, 8];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 5, , 7]);
                        session = this.driver.session();
                        transaction = session.beginTransaction();
                        return [4 /*yield*/, transaction.run(request, parameter)];
                    case 3:
                        result = _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 4:
                        _a.sent();
                        if (nbTry > 0)
                            process.stdout.write("\rDatabase ready.                                               \n");
                        return [2 /*return*/, result.records];
                    case 5:
                        Error_1 = _a.sent();
                        process.stdout.write("\rData base not ready... Retrying in " + waitingTime + " sec (" + nbTry + "/" + maxTry + ")");
                        console.log(Error_1);
                        return [4 /*yield*/, new Promise(function (res) { return setTimeout(function () { return res(); }, waitingTime * 1000); })];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 7:
                        nbTry++;
                        return [3 /*break*/, 1];
                    case 8:
                        process.stdout.write("\rData base not ready... Retrying in " + waitingTime + " sec (" + maxTry + "/" + maxTry + ")" + "\n");
                        console.log("Cannot connect to the database...");
                        (0, process_1.exit)(1);
                        return [2 /*return*/];
                }
            });
        });
    };
    return NeoGraph;
}());
exports.default = NeoGraph;
