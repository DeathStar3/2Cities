export declare enum EntityAttribut {
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
export declare enum EntityType {
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
export declare enum EntityVisibility {
    PUBLIC = "PUBLIC",
    PRIVATE = "PRIVATE"
}
export declare enum UnknownEntity {
    UNKNOWN = "UNKNOWN"
}
export declare enum RelationType {
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
export declare enum DesignPatternType {
    STRATEGY = "STRATEGY",
    FACTORY = "FACTORY",
    TEMPLATE = "TEMPLATE",
    DECORATOR = "DECORATOR",
    COMPOSITION_STRATEGY = "COMPOSITION_STRATEGY"
}
export type NodeType = EntityAttribut | EntityType | EntityVisibility | UnknownEntity | RelationType | DesignPatternType;
