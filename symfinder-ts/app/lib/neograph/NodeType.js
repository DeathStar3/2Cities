"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesignPatternType = exports.RelationType = exports.UnknownEntity = exports.EntityVisibility = exports.EntityType = exports.EntityAttribut = void 0;
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
var EntityAttribut;
(function (EntityAttribut) {
    EntityAttribut["ABSTRACT"] = "ABSTRACT";
    EntityAttribut["OUT_OF_SCOPE"] = "OUT_OF_SCOPE";
    EntityAttribut["VP"] = "VP";
    EntityAttribut["METHOD_LEVEL_VP"] = "METHOD_LEVEL_VP";
    EntityAttribut["VARIANT"] = "VARIANT";
    EntityAttribut["VP_FOLDER"] = "VP_FOLDER";
    EntityAttribut["VARIANT_FOLDER"] = "VARIANT_FOLDER";
    EntityAttribut["VARIANT_FILE"] = "VARIANT_FILE";
    EntityAttribut["CORE_FILE"] = "CORE_FILE";
    EntityAttribut["PROXIMITY_ENTITY"] = "PROXIMITY_ENTITY";
    EntityAttribut["COMMON_METHOD"] = "COMMON_METHOD";
})(EntityAttribut = exports.EntityAttribut || (exports.EntityAttribut = {}));
var EntityType;
(function (EntityType) {
    EntityType["CLASS"] = "CLASS";
    EntityType["METHOD"] = "METHOD";
    EntityType["CONSTRUCTOR"] = "CONSTRUCTOR";
    EntityType["INTERFACE"] = "INTERFACE";
    EntityType["FUNCTION"] = "FUNCTION";
    EntityType["VARIABLE"] = "VARIABLE";
    EntityType["PARAMETER"] = "PARAMETER";
    EntityType["PROPERTY"] = "PROPERTY";
    EntityType["FILE"] = "FILE";
    EntityType["DIRECTORY"] = "DIRECTORY";
    EntityType["MODULE"] = "MODULE";
})(EntityType = exports.EntityType || (exports.EntityType = {}));
var EntityVisibility;
(function (EntityVisibility) {
    EntityVisibility["PUBLIC"] = "PUBLIC";
    EntityVisibility["PRIVATE"] = "PRIVATE";
})(EntityVisibility = exports.EntityVisibility || (exports.EntityVisibility = {}));
var UnknownEntity;
(function (UnknownEntity) {
    UnknownEntity["UNKNOWN"] = "UNKNOWN";
})(UnknownEntity = exports.UnknownEntity || (exports.UnknownEntity = {}));
var RelationType;
(function (RelationType) {
    RelationType["METHOD"] = "METHOD";
    RelationType["INNER"] = "INNER";
    RelationType["IMPLEMENTS"] = "IMPLEMENTS";
    RelationType["EXTENDS"] = "EXTENDS";
    RelationType["INSTANTIATE"] = "INSTANTIATE";
    RelationType["EXPORT"] = "EXPORT";
    RelationType["INTERNAL"] = "INTERNAL";
    RelationType["IMPORT"] = "IMPORT";
    RelationType["LOAD"] = "LOAD";
    RelationType["CHILD"] = "CHILD";
    RelationType["CODE_CLONE"] = "CODE_CLONE";
    RelationType["CORE_CONTENT"] = "CORE_CONTENT";
    RelationType["TYPE_OF"] = "TYPE_OF";
})(RelationType = exports.RelationType || (exports.RelationType = {}));
var DesignPatternType;
(function (DesignPatternType) {
    DesignPatternType["STRATEGY"] = "STRATEGY";
    DesignPatternType["FACTORY"] = "FACTORY";
    DesignPatternType["TEMPLATE"] = "TEMPLATE";
    DesignPatternType["DECORATOR"] = "DECORATOR";
    DesignPatternType["COMPOSITION_STRATEGY"] = "COMPOSITION_STRATEGY";
})(DesignPatternType = exports.DesignPatternType || (exports.DesignPatternType = {}));
