import {Color, ConfigClones, ConfigColor, ConfigInterface, D3Config, D3FnfConfig} from "../entities/config.interface";
import {Orientation} from "./orientation.enum";
import {Vector3} from "@babylonjs/core";

export enum CriticalLevel {
    LOW_IMPACT = 0,
    RERENDER_SCENE = 1,
    REPARSE_DATA = 2
}

export class MetricSpec {
    min: number;
    max: number;
    higherIsBetter: boolean;

    constructor() {
        this.min = 0
        this.max = 100
        this.higherIsBetter = false;
    }
}

export class Config implements ConfigInterface {

    id?: string; //for persistence
    projectId?: string; //for persistence
    name?: string;
    description: string;
    building: D3Config;
    fnf_base: D3FnfConfig;
    // building: ConfigColor;
    // district: ConfigColor;
    district: D3Config;
    link: {
        colors: [Color],
        display: {
            air_traffic: string[],
            bridges: string[],
            underground_road: string[],
        }
    };
    vp_building: {
        color: string; // HEX color string
    };
    hierarchy_links: string[];
    blacklist: string[];
    clones: ConfigClones;
    force_color: string; // HEX color string
    api_classes: string[];
    variables: {
        width: string;
        height: string;
        intensity: string;
        fade: string;
        crack: string;
    };

    camera_data: CameraData;

    parsing_mode: string;
    orientation: Orientation;
    default_level: number;

    metrics: Map<string, MetricSpec>;

    constructor() {
    }

    public static instanceOfColor(object: any): object is Color {
        return object &&
            object.name && typeof (object.name) == "string" &&
            object.color && typeof (object.color) == "string";
    }

    public static instanceOfConfigColor(object: any): object is ConfigColor {
        return object &&
            // object.outline && typeof (object.outline) == "string" &&
            object.edges && Array.isArray(object.edges) && object.edges.every((v: any) => this.instanceOfColor(v)) &&
            object.faces && Array.isArray(object.faces) && object.faces.every((v: any) => this.instanceOfColor(v)) &&
            object.outlines && Array.isArray(object.outlines) && object.outlines.every((v: any) => this.instanceOfColor(v));
    }
}

// TODO move to new file
export class CameraData {
    alpha: number;
    beta: number;
    radius: number;
    target: Vector3_Local;

    constructor(alpha: number, beta: number, radius: number, position: Vector3_Local) {
        this.alpha = alpha;
        this.beta = beta;
        this.radius = radius;
        this.target = position;
    }

}

export class Vector3_Local {
    x: number;
    y: number;
    z: number;

    constructor(x?: number, y?: number, z?: number) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }

    public static toVector3(v: Vector3_Local): Vector3 {
        return new Vector3(v.x, v.y, v.z);
    }

    public static fromVector3(v: Vector3): Vector3_Local {
        return new Vector3_Local(v.x, v.y, v.z);
    }
}

export class ConfigName {
    name: string;
    filename: string;
    isDefault?: boolean;

    constructor(name: string, filename: string) {
        this.name = name;
        this.filename = filename;
    }
}

export class SaveResponseConfig {
    config: Config;
    filename: string;
}

export enum BackgroundColor {
    LIGHT="LIGHT",
    DARK="DARK",
}
