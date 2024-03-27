export class CameraData {
  alpha: number;
  beta: number;
  radius: number;
  target: Vector3;

  constructor(alpha: number, beta: number, radius: number, target: Vector3) {
    this.alpha = alpha;
    this.beta = beta;
    this.radius = radius;
    this.target = target;
  }
}

export enum Orientation {
  IN = 'IN',
  OUT = 'OUT',
  IN_OUT = 'IN_OUT',
}

export interface ConfigClones {
  map: Map<
    string,
    {
      original: any;
      clones: any;
    }
  >;
}

export interface Color {
  name: string;
  color: string; // HEX COLOR string
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

export interface ConfigFnfColor {
  edges: Color[],
  base: Color[]
}

export interface ConfigColor {
  // colors: {
  edges: Color[]; // HEX color string
  faces: Color[];
  outlines: Color[];
  // }
}

export class Vector3 {
  x?: number;
  y?: number;
  z?: number;
}

export class VaricityConfig {
  id?: string; //for persistence
  name?: string;
  projectId?: string; //for persistence
  description: string;
  username: string;
  timestamp: string; //isodate
  building: D3Config;
  fnf_base: D3FnfConfig;
  // building: ConfigColor;
  // district: ConfigColor;
  district: D3Config;
  link: {
    colors: [Color];
    display: {
      air_traffic: string[];
      underground_road: string[];
    };
  };
  vp_building: {
    color: string; // HEX color string
  };
  hierarchy_links: string[];
  blacklist: string[];
  clones: ConfigClones;
  force_color: string; // HEX color string
  api_classes: string[]; // a list instead of a map
  variables: {
    width: string;
    height: string;
  };
  parsing_mode: string;
  orientation: Orientation;
  default_level: number;

  metrics: Map<string, MetricSpec>;

  camera_data: CameraData;
}

export class MetricSpec {
  min: number;
  max: number;
  higherIsBetter: boolean;

  constructor() {
    this.min = 0;
    this.max = 100;
    this.higherIsBetter = false;
  }
}