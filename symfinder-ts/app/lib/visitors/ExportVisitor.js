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
var SymfinderVisitor_1 = require("./SymfinderVisitor");
var typescript_1 = require("typescript");
var path_1 = require("../utils/path");
var NodeType_1 = require("../neograph/NodeType");
var async_mutex_1 = require("async-mutex");
var path = require("path");
var ExportVisitor = /** @class */ (function (_super) {
    __extends(ExportVisitor, _super);
    function ExportVisitor(neoGraph, program) {
        var _this = _super.call(this, neoGraph) || this;
        _this.program = program;
        _this.exportMutex = new async_mutex_1.Mutex();
        _this.unknownSourcesMutex = new async_mutex_1.Mutex();
        _this.unknownSources = 0;
        return _this;
    }
    /** Visit export node.
     * Create EXPORT link for the node "export { A, B...} from 'path'" or "export * from 'path'"
     * Change the link INTERNAL to EXPORT for the node "export { A, B... }"
     * @param node A source file
     */
    ExportVisitor.prototype.visit = function (node) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var filePath, fileName, fileNode, checker, exports, exportOriginals, _i, exports_1, symbol, originalSymbol, exportCorrects, _b, exportCorrects_1, exportExternal, declaration, modulePath, exportedElementNode;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!(0, typescript_1.isSourceFile)(node))
                            return [2 /*return*/];
                        filePath = path.relative(process.env.PROJECT_PATH, node.fileName).substring(6);
                        fileName = (0, path_1.filname_from_filepath)(filePath);
                        return [4 /*yield*/, this.neoGraph.getNodeWithPath(fileName, filePath)];
                    case 1:
                        fileNode = _c.sent();
                        if (fileNode === undefined) {
                            console.log("Cannot find file : '" + filePath + "' in graph...");
                            return [2 /*return*/];
                        }
                        checker = this.program.getTypeChecker();
                        if (checker.getSymbolAtLocation(node) === undefined)
                            return [2 /*return*/]; // Can happen if the file is empty or its content is only comments
                        exports = checker.getExportsOfModule(checker.getSymbolAtLocation(node));
                        console.log(exports);
                        exportOriginals = [];
                        for (_i = 0, exports_1 = exports; _i < exports_1.length; _i++) {
                            symbol = exports_1[_i];
                            console.log(symbol);
                            if (symbol.flags == typescript_1.SymbolFlags.Alias) {
                                originalSymbol = this.getOriginalSymbol(symbol, checker);
                                console.log(originalSymbol);
                                if (originalSymbol !== undefined && originalSymbol.escapedName !== "unknown")
                                    symbol = originalSymbol;
                                else {
                                    this.incrementUnknownSource();
                                    continue;
                                }
                            }
                            if (symbol.escapedName === "default") {
                                this.incrementUnknownSource();
                                continue; // They are many cases and handle them can be long whereas the count is low
                            }
                            if (this.isAcceptedType(symbol.flags))
                                exportOriginals.push(symbol);
                            else
                                this.incrementUnknownSource();
                        }
                        exportCorrects = exportOriginals.filter(function (symbol) { return _this.isPathCorrect(_this.getPath(symbol)); });
                        this.incrementUnknownSource(exportOriginals.length - exportCorrects.length);
                        if (exportCorrects.length === 0)
                            return [2 /*return*/];
                        console.log(exportCorrects);
                        _b = 0, exportCorrects_1 = exportCorrects;
                        _c.label = 2;
                    case 2:
                        if (!(_b < exportCorrects_1.length)) return [3 /*break*/, 10];
                        exportExternal = exportCorrects_1[_b];
                        console.log(exportExternal);
                        if (exportExternal.declarations === undefined) {
                            console.log("Declarations undefined, ignore");
                            this.incrementUnknownSource();
                            return [3 /*break*/, 9];
                        }
                        declaration = exportExternal.declarations[0];
                        modulePath = this.getPath(checker.getSymbolAtLocation((_a = declaration.propertyName) !== null && _a !== void 0 ? _a : declaration.name));
                        if (modulePath.endsWith(".d.ts")) {
                            this.incrementUnknownSource();
                            return [3 /*break*/, 9];
                        }
                        return [4 /*yield*/, this.getNode(exportExternal, modulePath)];
                    case 3:
                        exportedElementNode = _c.sent();
                        if (!(exportedElementNode !== undefined)) return [3 /*break*/, 8];
                        if (!(modulePath === filePath)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.neoGraph.updateLinkTwoNode(fileNode, exportedElementNode, NodeType_1.RelationType.INTERNAL, NodeType_1.RelationType.EXPORT)];
                    case 4:
                        _c.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, this.neoGraph.linkTwoNodes(fileNode, exportedElementNode, NodeType_1.RelationType.EXPORT)];
                    case 6:
                        _c.sent();
                        _c.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        this.incrementUnknownSource();
                        console.log("Error to link nodes " + filePath + " and " + modulePath + " - cannot get " + exportExternal.escapedName);
                        _c.label = 9;
                    case 9:
                        _b++;
                        return [3 /*break*/, 2];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    ExportVisitor.prototype.getPath = function (symbol) {
        var name = "";
        if (symbol.valueDeclaration !== undefined) {
            var parent_1 = symbol.valueDeclaration.parent;
            while (!('fileName' in parent_1))
                parent_1 = parent_1.parent;
            name = parent_1.fileName;
        }
        else if ("parent" in symbol && symbol.parent !== undefined) {
            name = symbol.parent.getEscapedName().toString();
            if (name.startsWith("\"") && name.endsWith("\""))
                name = name.slice(1, -1);
        }
        else {
            console.log("Can't get the escaped name");
            return "";
        }
        if (name === undefined)
            return "";
        if (!name.endsWith(".ts"))
            name += ".ts";
        if (path.isAbsolute(name))
            // @ts-ignore
            name = path.relative(process.env.PROJECT_PATH, name).substring(6);
        return name;
    };
    ExportVisitor.prototype.getOriginalSymbol = function (symbol, checker) {
        while (symbol.flags == typescript_1.SymbolFlags.Alias) {
            var alias = checker.getAliasedSymbol(symbol);
            if ("exports" in alias) {
                var exportsAlias = alias.exports;
                if (alias.flags != typescript_1.SymbolFlags.TypeAlias && exportsAlias != undefined) {
                    if (exportsAlias.size > 0) {
                        exportsAlias.forEach(function (value, key) {
                            if (key === "prototype")
                                symbol = value.parent;
                            else
                                symbol = value;
                        });
                    }
                    else
                        symbol = alias;
                }
                else
                    return undefined;
            }
            else
                symbol = alias;
        }
        return symbol;
    };
    ExportVisitor.prototype.isPathCorrect = function (symbolPath) {
        return symbolPath.length > 0;
    };
    ExportVisitor.prototype.getNode = function (symbol, filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var name;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        name = symbol.getEscapedName().toString();
                        if (!!filePath.includes("/")) return [3 /*break*/, 2];
                        this.incrementUnknownSource();
                        console.log("No path for '" + filePath + "', it is a part of the base library ? A out of scope node '" + name + "' will be created");
                        return [4 /*yield*/, this.exportMutex.runExclusive(function () { return __awaiter(_this, void 0, void 0, function () {
                                var node, fileNode;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.neoGraph.getOrCreateNode(name, this.symbolFlagsToEntityType(symbol.flags), [NodeType_1.EntityAttribut.OUT_OF_SCOPE], [])];
                                        case 1:
                                            node = _a.sent();
                                            return [4 /*yield*/, this.neoGraph.getOrCreateNodeWithPath(name, filePath, NodeType_1.EntityType.FILE, [NodeType_1.EntityAttribut.OUT_OF_SCOPE], [])];
                                        case 2:
                                            fileNode = _a.sent();
                                            return [4 /*yield*/, this.neoGraph.linkTwoNodes(node, fileNode, NodeType_1.RelationType.EXPORT)];
                                        case 3:
                                            _a.sent();
                                            return [2 /*return*/, node];
                                    }
                                });
                            }); })];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        if (!(symbol.flags === typescript_1.SymbolFlags.Method)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.neoGraph.getNodeByClass(name, filePath)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4: return [2 /*return*/, this.neoGraph.getNodeWithFile(name, filePath)];
                }
            });
        });
    };
    ExportVisitor.prototype.symbolFlagsToEntityType = function (flags) {
        switch (flags) {
            case typescript_1.SymbolFlags.Interface:
                return NodeType_1.EntityType.INTERFACE;
            default:
                console.log("Unknown conversion for " + flags);
                return NodeType_1.EntityType.CLASS;
        }
    };
    ExportVisitor.prototype.incrementUnknownSource = function (count) {
        var _this = this;
        if (count === void 0) { count = 1; }
        this.unknownSourcesMutex.runExclusive(function () { return _this.unknownSources += count; });
    };
    ExportVisitor.prototype.getUnknownSourcesCount = function () {
        return this.unknownSources;
    };
    ExportVisitor.prototype.isAcceptedType = function (flags) {
        return flags === typescript_1.SymbolFlags.Class || flags === typescript_1.SymbolFlags.Interface || flags === typescript_1.SymbolFlags.Method || flags === typescript_1.SymbolFlags.Constructor
            || flags === typescript_1.SymbolFlags.Function || flags === typescript_1.SymbolFlags.Variable || flags === typescript_1.SymbolFlags.Property || flags === typescript_1.SymbolFlags.Module ||
            flags === (typescript_1.SymbolFlags.Class + typescript_1.SymbolFlags.Interface) || flags === typescript_1.SymbolFlags.BlockScopedVariable;
    };
    return ExportVisitor;
}(SymfinderVisitor_1.default));
exports.default = ExportVisitor;
