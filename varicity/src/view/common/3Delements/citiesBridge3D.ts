import {Link3D} from '../3Dinterfaces/link3D.interface';
import {Config} from '../../../model/entitiesImplems/config.model';
import {Color3, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3} from '@babylonjs/core';
import {Building3D} from './building3D';
import {D3Utils} from "../3D.utils";

export class CitiesBridge3D implements Link3D {
    scene: Scene;

    src: Building3D;
    dest: Building3D
    type: string;
    percentage: number;

    downRoadMesh: Mesh;
    upRoadMesh: Mesh;
    roadMesh: Mesh

    force: boolean = false;

    config: Config;

    destroyed: boolean;

    constructor(src: Building3D, dest: Building3D, type: string, scene: Scene, config: Config) {
        this.src = src;
        this.dest = dest;
        this.type = type;
        this.scene = scene;
        this.config = config;
    }

    render(bool: boolean): void {
        if (!bool) {
            this.downRoadMesh.dispose(false, true);
            delete this.downRoadMesh;
            this.roadMesh.dispose(false, true);
            delete this.roadMesh;
            this.upRoadMesh.dispose(false, true);
            delete this.upRoadMesh;
            return;
        }
        const underGroundBuildingHeight = Math.abs(this.src.elementModel.compLevel - 1 - this.dest.elementModel.compLevel);
        const underGroundBuildingWidth = 0.2;
        this.downRoadMesh = MeshBuilder.CreateBox("downRoad", {
            width: underGroundBuildingWidth,
            height: 0.001,
            depth: underGroundBuildingHeight
        }, this.scene);
        this.upRoadMesh = MeshBuilder.CreateBox("upRoad", {
            width: underGroundBuildingWidth,
            height: 0.001,
            depth: underGroundBuildingHeight
        }, this.scene);

        let midBox: Vector3 = this.src.bot.add(new Vector3(0, underGroundBuildingHeight / 2, 0))
        let botBox: Vector3 = midBox.add(new Vector3(0, underGroundBuildingHeight / 2, 0));
        this.downRoadMesh.setPositionWithLocalVector(midBox);

        let upMidBox: Vector3 = this.dest.bot.add(new Vector3(0, underGroundBuildingHeight / 2, 0))
        let upBotBox: Vector3 = upMidBox.add(new Vector3(0, underGroundBuildingHeight / 2, 0));
        this.upRoadMesh.setPositionWithLocalVector(upMidBox)

        D3Utils.facePoint(this.downRoadMesh, new Vector3(this.dest.top.x, underGroundBuildingHeight / 2, this.dest.top.z));
        D3Utils.facePoint(this.upRoadMesh, new Vector3(this.src.top.x, underGroundBuildingHeight / 2, this.src.top.z));


        const roadLength = Vector3.Distance(botBox, upBotBox);
        this.roadMesh = MeshBuilder.CreateBox("road", {
            width: underGroundBuildingWidth,
            height: roadLength,
            depth: 0.001
        }, this.scene);
        // this.roadMesh.setPositionWithLocalVector(new Vector3(
        //     botBox.x + (this.dest.bot.x - botBox.x) / 2,
        //     botBox.y + (this.dest.bot.y - botBox.y) / 2,
        //     botBox.z + (this.dest.bot.z - botBox.z) / 2
        // ));
        this.roadMesh.setPositionWithLocalVector(new Vector3(
            this.src.top.x + (this.dest.top.x - this.src.top.x) / 2,
            this.src.top.y + (this.dest.top.y - this.src.top.y) / 2,
            this.src.top.z + (this.dest.top.z - this.src.top.z) / 2,
        ))

        D3Utils.facePoint(this.roadMesh, new Vector3(this.dest.top.x, this.dest.top.y, this.dest.top.z));

        let mat = new StandardMaterial(this.downRoadMesh.name + "Mat", this.scene);
        if (this.config.link.colors) {
            for (let c of this.config.link.colors) {
                if (c.name == this.type) {
                    mat.ambientColor = Color3.FromHexString(c.color);
                    mat.diffuseColor = Color3.FromHexString(c.color);
                    mat.emissiveColor = Color3.FromHexString(c.color);
                    mat.specularColor = Color3.FromHexString(c.color);
                    mat.alpha = 1;
                    mat.backFaceCulling = false;
                    this.downRoadMesh.material = mat;
                    this.upRoadMesh.material = mat;
                    this.roadMesh.material = mat;
                    return;
                }
            }
        }
    }

    display(force?: boolean, show?: boolean): void {
        if (force != undefined) this.force = force;
        if (!show && !this.force && this.downRoadMesh) {
            this.render(false);
            this.destroyed = true;
        } else {
            if (show && ((force == undefined || this.force) && !this.downRoadMesh)) {
                this.render(true);
            }
        }
    }
}