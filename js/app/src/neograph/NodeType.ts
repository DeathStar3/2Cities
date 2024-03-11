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
export enum EntityAttribut {
    ABSTRACT = "ABSTRACT",
    OUT_OF_SCOPE = "OUT_OF_SCOPE",
    VP = "VP",
    METHOD_LEVEL_VP = "METHOD_LEVEL_VP",
    VARIANT = "VARIANT",
    VP_FOLDER = "VP_FOLDER",
    VARIANT_FOLDER = "VARIANT_FOLDER",
    VARIANT_FILE = "VARIANT_FILE",
    CORE_FILE = "CORE_FILE",
    PROXIMITY_ENTITY = "PROXIMITY_ENTITY",
    COMMON_METHOD = "COMMON_METHOD"
}

export enum EntityType {
    CLASS = "CLASS",
    METHOD = "METHOD",
    CONSTRUCTOR = "CONSTRUCTOR",
    INTERFACE = "INTERFACE",
    FUNCTION = "FUNCTION",
    VARIABLE = "VARIABLE",
    PARAMETER = "PARAMETER",
    PROPERTY = "PROPERTY",
    FILE = "FILE",
    DIRECTORY = "DIRECTORY",
    MODULE = "MODULE"
}

export enum EntityVisibility {
    PUBLIC = "PUBLIC",
    PRIVATE = "PRIVATE"
}

export enum UnknownEntity {
    UNKNOWN = "UNKNOWN"
}

export enum RelationType {
    METHOD = "METHOD",
    INNER = "INNER",
    IMPLEMENTS = "IMPLEMENTS",
    EXTENDS = "EXTENDS",
    INSTANTIATE = "INSTANTIATE",
    EXPORT = "EXPORT",
    INTERNAL = "INTERNAL",
    IMPORT = "IMPORT",
    LOAD = "LOAD",
    CHILD = "CHILD",
    CODE_CLONE = "CODE_CLONE",
    CORE_CONTENT = "CORE_CONTENT",
    TYPE_OF = "TYPE_OF"
}

export enum DesignPatternType {
    STRATEGY = "STRATEGY",
    FACTORY = "FACTORY",
    TEMPLATE = "TEMPLATE",
    DECORATOR = "DECORATOR",
    COMPOSITION_STRATEGY = "COMPOSITION_STRATEGY"
}

export type NodeType = EntityAttribut | EntityType | EntityVisibility | UnknownEntity | RelationType | DesignPatternType;
