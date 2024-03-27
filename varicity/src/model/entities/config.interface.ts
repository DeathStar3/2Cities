import {Building3D} from '../../view/common/3Delements/building3D';
import {Orientation} from "../entitiesImplems/orientation.enum";

export interface Color {
    name: string;
    color: string; // HEX COLOR string
}

export interface ConfigColor {
    // colors: {
    edges: Color[], // HEX color string
    faces: Color[],
    outlines: Color[]
    // }
}

export interface ConfigFnfColor {
    edges: Color[],
    base: Color[]
}

export enum FileDislayEnum {
    FORCE = "force",
    ADAPTATIVE = "adaptative"
}

export interface DisplayInterface {
    file_size: FileDislayEnum;
}

export interface D3Config {
    padding: number;
    display: DisplayInterface;
    colors: ConfigColor;
}

export interface D3FnfConfig {
    padding: number;
    display: DisplayInterface;
    colors: ConfigFnfColor;
}

export interface ConfigClones {
    map: Map<string, {
        original: Building3D,
        clones: Building3D[]
    }>,
}

export interface ConfigInterface {
    id?: string; //for persistence
    projectId?: string; //for persistence
    building: D3Config;
    fnf_base: D3FnfConfig
    // building: ConfigColor;
    district: D3Config;
    // district: ConfigColor;
    link: {
        colors: Color[],
        display: {
            air_traffic: string[],
            underground_road: string[],
        }
    };

    vp_building: {
        color: string; // HEX color string
    }

    hierarchy_links: string[];

    blacklist: string[]; //all classes that must not appear
    api_classes: string[];

    clones: ConfigClones;

    force_color: string; // HEX color string

    variables: {
        width: string,
        height: string,
    }

    orientation: Orientation;

    default_level: number;
}

