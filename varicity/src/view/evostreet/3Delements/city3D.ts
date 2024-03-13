import { Config } from '../../../model/entitiesImplems/config.model';
import { VPVariantsImplem } from '../../../model/entitiesImplems/vpVariantsImplem.model';
import { Link } from '../../../model/entities/link.interface';
import { Color3, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from '@babylonjs/core';
import { Building3D } from '../../common/3Delements/building3D';
import { Road3D } from './road3D';
import { EntitiesList } from '../../../model/entitiesList';
import { Link3DFactory } from '../../common/3Dfactory/link3D.factory';
import { Link3D } from "../../common/3Dinterfaces/link3D.interface";

export class City3D {

    config: Config;
    scene: Scene;

    // Is this road the main road
    road: Road3D;

    highway: Road3D;

    file_road: Road3D;

    links: Link[] = [];

    floor: Mesh;

    constructor(config: Config, scene: Scene, entities: EntitiesList) {
        this.config = config;
        this.scene = scene;
        this.links = entities.links;
        this.init(entities);
    }

    private init(entities: EntitiesList) {
        this.road = new Road3D(this.scene, entities.district as VPVariantsImplem, this.config, "Class district");
        this.file_road = new Road3D(this.scene, entities.file_district as VPVariantsImplem, this.config, "File district")
        this.highway = new Road3D(this.scene, null, this.config);
        this.highway.forcedLength = 10;
    }

    private findSrcLink(name: string): Building3D {
        let res = this.road.get(name);
        if (res !== undefined)
            return res
        return this.file_road.get(name);
    }

    private registerLink(link: Link3D, src: Building3D, dest: Building3D) {
        if (link) {
            src.link(link);
            dest.link(link);
        }
    }

    build() {
        this.config.clones = {
            map: new Map<string, {
                original: Building3D,
                clones: Building3D[]
            }>()
        };

        this.road.build(this.config);
        this.highway.build(this.config);
        this.file_road.build(this.config);
        this.links.forEach(l => {
            let type = l.type;
            // we only want to show INSTANTIATE type links since the visualization is based off IMPLEMENTS & EXTENDS hierarchy
            let src = this.findSrcLink(l.source.name);
            let dest = this.findSrcLink(l.target.name);
            if (src !== undefined && dest !== undefined) {
                let link = Link3DFactory.createLink(src, dest, type, l.percentage, this.scene, this.config);
                this.registerLink(link, src, dest);
            }
        });

        for (let [, value] of this.config.clones.map) {
            for (let b of value.clones) {
                if (b !== undefined) {
                    let link = Link3DFactory.createLink(value.original, b, "DUPLICATES", undefined, this.scene, this.config);
                    this.registerLink(link, value.original, b);
                }
            }
        }

        this.floor = MeshBuilder.CreateBox(
            "cityFloor",
            {
                height: 0.01,
                width: this.getSize(),
                depth: this.getSize()
            },
            this.scene);
    }

    getSize(): number {
        return Math.max(this.road.getSideWidth(true) * 2, this.road.getSideWidth(false) * 2, this.road.getLength());
    }

    place() {
        this.road.place(0, 0, 1, 0);
        this.highway.place(this.road.getRoadLength(), 0, 1, 0);
        this.file_road.place(this.road.getRoadLength() + this.highway.getRoadLength(), 0, 1, 0);
        this.floor.setPositionWithLocalVector(new Vector3(this.getSize() / 2, -0.01, 0));
    }

    render() {
        this.road.render(this.config);
        this.highway.render(this.config)
        this.file_road.render(this.config);
        let mat = new StandardMaterial("FloorMat", this.scene);
        mat.ambientColor = Color3.FromHexString("#222222");
        mat.diffuseColor = Color3.FromHexString("#222222");
        mat.emissiveColor = Color3.FromHexString("#222222");
        mat.specularColor = Color3.FromHexString("#000000");

        // Increase to see the floor under the City
        mat.alpha = 0;

        this.floor.material = mat;
    }
}
