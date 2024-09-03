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

        // const srcConnectorHeight = ((this.src.elementModel.maxClone)) - (this.src.elementModel.metrics.getMetricValue("nbClones")))/2
        // console.log((this.src.elementModel.maxClone/2))
        // console.log("src top")
        // console.log(this.src.top._y)
        // let maxClone = this.src.elementModel.maxClone / 2;
        // console.log("maxCLone")
        // console.log(maxClone)
        // if (this.src.elementModel.maxClone / 2 > 7) {
        //     maxClone = 7;
        // } else {
        //     maxClone = this.src.elementModel.maxClone
        // }
        // const srcConnectorHeight = (maxClone - this.src.top._y) + 0.25
        // // const targetConnectorHeight = ((this.dest.elementModel.maxClone)) - (this.dest.elementModel.metrics.getMetricValue("nbClones")))/2;
        // const targetConnectorHeight = (maxClone - this.dest.top._y) + 0.25

        const srcConnectorHeight = (this.src.elementModel.maxClone - this.src.elementModel.metrics.getMetricValue("nbClones")) / 2 + 0.25
        const targetConnectorHeight = (this.dest.elementModel.maxClone - this.dest.elementModel.metrics.getMetricValue("nbClones")) / 2 + 0.25

        console.log(srcConnectorHeight);
        console.log(targetConnectorHeight)

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

        this.srcConnectorMesh.setPositionWithLocalVector(this.src.top.add(new Vector3(0, (srcConnectorHeight / 2), 0)));
        this.targetConnectorMesh.setPositionWithLocalVector(this.dest.top.add(new Vector3(0, (targetConnectorHeight / 2), 0)));

        // let botSrcBox: Vector3;
        // botSrcBox = this.src.center.add(new Vector3(0, this.src.getHeight()/2 + 0.25, 0)); //bottom of clone shade
        // let topSrcBox: Vector3 = botSrcBox.add(new Vector3(0, srcNbClones / 4, 0));
        // this.srcConnectorMesh.setPositionWithLocalVector(
        //     this.src.top.add(
        //         new Vector3(
        //             0,
        //             srcConnectorHeight, // it is Y vector of the top. 
        //             0
        //         )          
        //     )
        // );

        // let botTargetBox: Vector3;
        // botTargetBox = this.dest.center.add(new Vector3(0, this.dest.getHeight()/2 + 0.25, 0));
        // let topTargetBox: Vector3 = botTargetBox.add(new Vector3(0, targetNbClones / 4, 0));
        // this.targetConnectorMesh.setPositionWithLocalVector(
        //     this.dest.top.add(
        //         new Vector3(
        //             0,
        //             targetConnectorHeight,
        //             0
        //         )
        //     )
        // );


        const bridgeLength = Vector3.Distance(this.src.top, this.dest.top);
        this.bridgeMesh = MeshBuilder.CreateBox("bridge", {
            width: connectorWidth,
            height: bridgeLength,
            depth: 0.01
        }, this.scene);
        this.bridgeMesh.setPositionWithLocalVector(new Vector3(
            // topSrcBox.x + (topTargetBox.x - topSrcBox.x) / 2,
            this.src.top.x + (this.dest.top.x - this.src.top.x) / 2,
            // topSrcBox.y + (topTargetBox.y - topSrcBox.y) / 2,
            this.src.top.y + srcConnectorHeight,
            // topSrcBox.z + (topTargetBox.z - topSrcBox.z) / 2
            this.src.top.z + (this.dest.top.z - this.src.top.z) / 2
        ));

        // this.bridgeMesh.setPositionWithLocalVector(topSrcBox);

        D3Utils.facePoint(this.bridgeMesh, this.dest.top.add(new Vector3(0, targetConnectorHeight, 0)));


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