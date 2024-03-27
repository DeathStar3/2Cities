import { Building3D } from "../3Delements/building3D";
import { Building } from "../../../model/entities/building.interface";
import { Scene } from "@babylonjs/core";
import { Config } from "../../../model/entitiesImplems/config.model";
import { FileBuilding3D } from "../3Delements/file-building3D";
import { CrownBuilding3D } from "../3Delements/crown3D";
import { CrownImplem } from "../../../model/entitiesImplems/crown.model"
import { NodeElement } from "../../../controller/parser/symfinder_elements/nodes/node.element";

export class Building3DFactory {

	private static isFile(element: Building): boolean {
		return element.types.includes("FILE");
	}

	private static isDirectory(element: Building): boolean {
		return element.types.includes("DIRECTORY");
	}

	private static isCrown(element: Building): boolean {
		return element.types.includes("CROWN");
	}

	public static createBuildingMesh(
		element: Building,
		depth: number,
		scene: Scene,
		config: Config
	): Building3D {
		if (!element || element.types === undefined) throw new Error("No element to work with");

		if (Building3DFactory.isCrown(element)) {
			return new Building3D(scene, element, depth, config)
		}
		else if (Building3DFactory.isDirectory(element)) {
			return new Building3D(scene, element, depth, config);
		}
		else if (Building3DFactory.isFile(element)) {
			return new FileBuilding3D(scene, element, depth, config);
		}
		else
			return new Building3D(scene, element, depth, config);
	}
}