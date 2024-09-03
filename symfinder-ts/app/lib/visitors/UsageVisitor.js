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
var NodeType_1 = require("../neograph/NodeType");
var path = require("path");
var UsageVisitor = /** @class */ (function (_super) {
    __extends(UsageVisitor, _super);
    function UsageVisitor(neoGraph, program) {
        var _this = _super.call(this, neoGraph) || this;
        _this.program = program;
        _this.unknownPaths = new Set();
        return _this;
    }
    /**
     * Visit different kind of variables found and publish their class type in neo4j
     * @param node AST node
     * @returns
     */
    UsageVisitor.prototype.visit = function (node) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var name, filePath, className, classPath, type, qualifiedName, correctFormat, entType, varNode, classNode, module_class;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(0, typescript_1.isVariableDeclaration)(node) && !(0, typescript_1.isParameter)(node) && !(0, typescript_1.isPropertyDeclaration)(node) && !(0, typescript_1.isMethodDeclaration)(node))
                            return [2 /*return*/];
                        name = (_a = node.name) === null || _a === void 0 ? void 0 : _a.getText();
                        if (name === undefined)
                            return [2 /*return*/];
                        filePath = node.getSourceFile().fileName.replace(/^.*?experiments_volume\//, '');
                        className = "";
                        classPath = "";
                        type = this.program.getTypeChecker().getTypeAtLocation(node);
                        if (type.flags != typescript_1.TypeFlags.Object || type.getSymbol() === undefined || type.objectFlags != (typescript_1.ObjectFlags.Class + typescript_1.ObjectFlags.Reference))
                            return [2 /*return*/];
                        if (type.symbol.flags === typescript_1.SymbolFlags.Method && node.type === undefined)
                            return [2 /*return*/]; //void method
                        qualifiedName = this.program.getTypeChecker().getFullyQualifiedName(type.getSymbol());
                        correctFormat = qualifiedName.match(/^"([a-zA-Z0-9-._\/]+)"\.([a-zA-Z_0-9.]+)$/);
                        if (correctFormat == null) {
                            classPath = filePath;
                            className = qualifiedName;
                        }
                        else {
                            classPath = correctFormat[1];
                            className = correctFormat[2];
                            if (classPath.includes("/")) {
                                // @ts-ignore
                                classPath = path.relative(process.env.PROJECT_PATH, classPath).substring(6) + ".ts";
                            }
                        }
                        switch (node.kind) {
                            case typescript_1.SyntaxKind.VariableDeclaration:
                                entType = NodeType_1.EntityType.VARIABLE;
                                break;
                            case typescript_1.SyntaxKind.Parameter:
                                entType = NodeType_1.EntityType.PARAMETER;
                                break;
                            case typescript_1.SyntaxKind.PropertyDeclaration:
                                entType = NodeType_1.EntityType.PROPERTY;
                                break;
                            case typescript_1.SyntaxKind.MethodDeclaration:
                                entType = NodeType_1.EntityType.METHOD;
                                break;
                        }
                        return [4 /*yield*/, this.neoGraph.getElementNodeWithFile(name, entType, filePath)];
                    case 1:
                        varNode = _b.sent();
                        if (!(varNode != undefined)) return [3 /*break*/, 16];
                        classNode = void 0;
                        if (!classPath.includes("/")) return [3 /*break*/, 6];
                        if (!className.includes(".")) return [3 /*break*/, 3];
                        module_class = className.split(".");
                        return [4 /*yield*/, this.neoGraph.getClassNodeByModule(module_class[1], module_class[0], classPath)];
                    case 2:
                        classNode = _b.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.neoGraph.getClassNodeWithPath(className, classPath)];
                    case 4:
                        classNode = _b.sent();
                        _b.label = 5;
                    case 5: return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, this.neoGraph.getClassNodeByModuleIfUnique(className, classPath)];
                    case 7:
                        classNode = _b.sent();
                        _b.label = 8;
                    case 8:
                        if (!(classNode == undefined)) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.neoGraph.getClassNodeWithImport(className, filePath)];
                    case 9:
                        classNode = _b.sent();
                        _b.label = 10;
                    case 10:
                        if (!(classNode == undefined)) return [3 /*break*/, 12];
                        return [4 /*yield*/, this.neoGraph.getClassNodeIfUnique(className)];
                    case 11:
                        classNode = _b.sent();
                        _b.label = 12;
                    case 12:
                        if (!(classNode != undefined)) return [3 /*break*/, 14];
                        return [4 /*yield*/, this.neoGraph.linkTwoNodes(varNode, classNode, NodeType_1.RelationType.TYPE_OF)];
                    case 13:
                        _b.sent();
                        return [3 /*break*/, 15];
                    case 14:
                        this.unknownPaths.add(qualifiedName);
                        console.log(filePath + " > Error to link 'usage' nodes " + name + " and " + className + "...");
                        _b.label = 15;
                    case 15: return [3 /*break*/, 17];
                    case 16:
                        console.log("Error to link 'usage' nodes because no node named '" + name + "' or with the file path '" + filePath + "' exists");
                        _b.label = 17;
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    UsageVisitor.prototype.getUnknownPaths = function () {
        return this.unknownPaths;
    };
    return UsageVisitor;
}(SymfinderVisitor_1.default));
exports.default = UsageVisitor;
