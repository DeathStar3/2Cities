import { Link3D } from '../3Dinterfaces/link3D.interface';
import { Color3, Color4, Curve3, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from "@babylonjs/core";
import { Building3D } from "./building3D";
import { Config } from "../../../model/entitiesImplems/config.model";
import { FileBuilding3D } from "./file-building3D";
import {D3Utils} from "../3D.utils";

export class CloneBridge3D implements Link3D {
	scene: Scene;

	src: Building3D;
	dest: Building3D;
	type: string;
	percentage: number;

	srcConnectorMesh: Mesh;
	targetConnectorMesh: Mesh;
    bridgeMesh: Mesh

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
            this.srcConnectorMesh.dispose(false, true);
            delete this.srcConnectorMesh;
            this.bridgeMesh.dispose(false, true);
            delete this.bridgeMesh;
			this.targetConnectorMesh.dispose(false, true);
			delete this.targetConnectorMesh;
            return;
        }

        const connectorWidth = 0.2;
        const connectorDepth = 0.01;

        const srcConnectorHeight = ((2 + (this.src.elementModel.maxClone)) - (this.src.elementModel.metrics.getMetricValue("nbClones")))/2;
        const targetConnectorHeight = ((2 +(this.dest.elementModel.maxClone)) - (this.dest.elementModel.metrics.getMetricValue("nbClones")))/2;

        console.log(srcConnectorHeight, targetConnectorHeight);

        this.srcConnectorMesh = MeshBuilder.CreateBox("srcConnector", {
            height: srcConnectorHeight,
            width: connectorWidth,
            depth: connectorDepth
        }, this.scene)

        this.targetConnectorMesh = MeshBuilder.CreateBox("targetConnector", {
            height: srcConnectorHeight, 
            width: connectorWidth,
            depth: connectorDepth
        }, this.scene);

        let srcNbClones = this.src.elementModel.metrics.getMetricValue("nbClones");
        let targetNbClones = this.dest.elementModel.metrics.getMetricValue("nbClones");

        let botSrcBox: Vector3;
        // if (srcNbClones === 1) {
        //     botSrcBox = this.src.top.add(new Vector3(0, (srcNbClones / 2), 0));
        // } else if (srcNbClones > 5) {
        //     botSrcBox = this.src.top.add(new Vector3(0, (srcNbClones / 2), 0));
        // } else {
        //     botSrcBox = this.src.top.add(new Vector3(0, (srcNbClones / 2), 0));
        // }
        botSrcBox = this.src.top.add(new Vector3(0, srcNbClones / 2, 0));
        let topSrcBox: Vector3 = botSrcBox.add(new Vector3(0, srcConnectorHeight, 0));
        this.srcConnectorMesh.setPositionWithLocalVector(botSrcBox);

        let botTargetBox: Vector3;
        // if (targetNbClones === 1) {
        //     botTargetBox = this.dest.top.add(new Vector3(0, (targetNbClones / 2), 0));
        // } else if (targetNbClones > 5) {
        //     botTargetBox = this.dest.top.add(new Vector3(0, (targetNbClones / 2), 0));
        // } else {
        //     botTargetBox = this.dest.top.add(new Vector3(0, (targetNbClones / 2), 0));
        // }
        botTargetBox = this.dest.top.add(new Vector3(0, targetNbClones / 2, 0));
        let topTargetBox: Vector3 = botTargetBox.add(new Vector3(0, targetConnectorHeight, 0));
        this.targetConnectorMesh.setPositionWithLocalVector(botTargetBox);

        const bridgeLength = Vector3.Distance(topSrcBox, topTargetBox);
        this.bridgeMesh = MeshBuilder.CreateBox("bridge", {
            width: connectorWidth,
            height: bridgeLength,
            depth: 0.01
        }, this.scene);
        this.bridgeMesh.setPositionWithLocalVector(new Vector3(
            topSrcBox.x + (topTargetBox.x - topSrcBox.x) / 2,
            topSrcBox.y + (topTargetBox.y - topSrcBox.y) / 2,
            topSrcBox.z + (topTargetBox.z - topSrcBox.z) / 2
        ));

        // this.bridgeMesh.setPositionWithLocalVector(topSrcBox);

        D3Utils.facePoint(this.bridgeMesh, topTargetBox);


        let mat = new StandardMaterial(this.srcConnectorMesh.name + "Mat", this.scene);
        if (this.config.link.colors) {
            for (let c of this.config.link.colors) {
                if (c.name == this.type) {
                    mat.ambientColor = Color3.FromHexString(c.color);
                    mat.diffuseColor = Color3.FromHexString(c.color);
                    mat.emissiveColor = Color3.FromHexString(c.color);
                    mat.specularColor = Color3.FromHexString(c.color);
                    mat.alpha = 1;
                    mat.backFaceCulling = false;
                    this.srcConnectorMesh.material = mat;
                    // this.targetConnectorMesh.material = mat;
                    this.bridgeMesh.material = mat;
                    return;
                }
            }
        }
    }

    display(force?: boolean, show?: boolean): void {
        if (force != undefined) this.force = force;
        if (!show && !this.force && this.srcConnectorMesh) {
            this.render(false);
            this.destroyed = true;
        } else {
            if (show && ((force == undefined || this.force) && !this.srcConnectorMesh)) {
                this.render(true);
            }
        }
    }
}