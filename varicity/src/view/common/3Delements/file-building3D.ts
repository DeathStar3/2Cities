import {Building3D} from "./building3D";
import {Color3, Mesh, MeshBuilder, Scene, Texture, Vector3, StandardMaterial} from "@babylonjs/core";
import {Building} from "../../../model/entities/building.interface";
import {Config} from "../../../model/entitiesImplems/config.model";
import {Building3DFactory} from "../3Dfactory/building3D.factory";
import {Link3D} from "../3Dinterfaces/link3D.interface";
import {FileDislayEnum} from "../../../model/entities/config.interface";

/**
 * This class represent a file and the classes that it exports.
 */
export class FileBuilding3D extends Building3D {
	private hat_city: Building3D[][] = [];
	private max_x: number = 5;
	private max_z: number = 5;
	private scale: number = 1;

	private classes: Map<string, Vector3> = new Map();

	/**
	 * Max width of a building in the hat city
	 */
	private class_width: number = 0;

	/**
	 * Is it the cylinder that adapt to hat city size?
	 */
	private readonly auto_scale: boolean = false;

	constructor(scene: Scene, building: Building, depth: number, config: Config) {
		super(scene, building, depth, config);
		this.auto_scale = this.config.building.display.file_size === FileDislayEnum.ADAPTATIVE;
		if (this.auto_scale) this.padding = 0.005
	}

	/**
	 * Determines how to place classes on top of file base cylinder
	 */
	private placeClasses() {
		const elements = this.elementModel.exportedClasses.map(model => Building3DFactory.createBuildingMesh(model as Building, 0, this.scene, this.config));
		elements.sort(
			(a: Building3D, b: Building3D) => a.getName().localeCompare(b.getName())); // Sort the class building by name
		for (let x = 0; x < this.max_x; x++) {
			this.hat_city.push([])
			for (let z = 0; z < this.max_z; z++) {
				const elem = elements.pop();
				elem.padding = 0.2
				this.hat_city[x].push(elem);

				this.class_width = Math.max(this.class_width, elem.getWidth()); // Minus 0.4 to remove some padding
			}
		}

		if (elements.length > 0)
			console.log("The classes ", elements, " were not included in the display for file ", this.elementModel.name); // log classes not places
	}

	build() {
		const length = this.elementModel.exportedClasses.length;
		let dim = Math.floor(Math.sqrt(length));
		this.max_x = this.max_z = dim;
		this.placeClasses();

		if (this.auto_scale && length > 0){ // Compute scaling for folder mesh
			const diameter = (this.class_width * this.max_x) / Math.cos(Math.PI / 4);
			this.scale = diameter / this.elementModel.getWidth(this.config.variables.width);
		}
	}

	place(x: number, z: number) {
		super.place(x, z);
	}

	getWidth(): number {
		return super.getWidth() * this.scale;
	}

	/**
	 *  Renders File base cylinder
	 * @param scale 
	 * @param sideOrientation 
	 * @param updatable 
	 * @returns 
	 */
	protected renderBaseElement(
		scale : number = 1,
		sideOrientation: number = Mesh.DEFAULTSIDE,
		updatable: boolean = false
	): Mesh {
		return MeshBuilder.CreateCylinder(
			this.elementModel.name,
			{
				height: this.getHeight(),
				diameter: this.elementModel.getWidth(this.config.variables.width) * scale,
				sideOrientation: sideOrientation,
				updatable: updatable
			},
			this.scene
		);
	}

	private drawMatrix(start_x, start_z, end_x, end_z, y, dim) {
		const offset_x = (end_x - start_x) / dim
		const offset_z = (end_z - start_z) / dim

		for (let x = start_x; x <= end_x; x += offset_x)
			for (let z = start_z; z < end_z; z += offset_z)
				MeshBuilder.CreateLines(
					"Matrix",
					{
						points: [new Vector3(x, y, z), new Vector3(x, y, z + offset_z)]
					},
					this.scene
				)

		for (let x = start_x; x < end_x; x += offset_x)
			for (let z = start_z; z <= end_z; z += offset_z)
				MeshBuilder.CreateLines(
					"Matrix",
					{
						points: [new Vector3(x, y, z), new Vector3(x + offset_z, y, z)]
					},
					this.scene
				)
	}

	render() {
		let old_types = Object.assign([], this.elementModel.types); // Save all the types that had the file
		this.elementModel.types = this.elementModel.types.filter(elem => elem !== "API"); // Remove API to not display a hat
		super.render(this.config, this.scale);

		for (const line of this.hat_city) // Attach links to building in hat_city
			line.forEach(building => {
				building.links = this.links.filter(
					link => link.dest.elementModel.name === building.elementModel.name ||
						link.src.elementModel.name === building.elementModel.name
				);
			});

		//max_x = matrix dimension
		const inner_square_dim = this.elementModel.getWidth(this.config.variables.width) * this.scale * Math.sqrt(2) / 2;
		let offset_x = inner_square_dim / this.max_x;
		let offset_z = inner_square_dim / this.max_z;
		let x = this.center.x - inner_square_dim / 2;
		let z_i = this.center.z - inner_square_dim / 2;
		let z = z_i;

		// this.drawMatrix(x, z, x + this.max_x * offset_x, z + this.max_z * offset_z, this.getHeight() + 0.1, this.max_x)

		const scale = offset_x / this.class_width // * (this.auto_scale ? 1 : 3); // Multiplication by 3 to eat a bit of padding cells

		for (const line of this.hat_city) {
			for (const building of line) {
				if (building !== undefined) {
					building.place(x + (offset_x / 2), z + (offset_z / 2));
					this.classes.set(
						building.elementModel.name,
						building.center.add(new Vector3(0, this.getHeight(), 0))
					)
					building.render(this.config, scale);
					building.d3Model.translate(new Vector3(0, 1, 0), this.getHeight());
				}
				z += offset_z;
			}
			z = z_i;
			x += offset_x;
		}

		this.updateBuildingTexture();

		this.elementModel.types = old_types; // Reset the types of the file
	}

	getPositionForBuilding(building_name: string) {
		if (this.classes.has(building_name)) {
			return this.classes.get(building_name);
		}
		return this.center;
	}

	updateBuildingTexture(){
		if(this.links.some(l=> l.type == "CORE_CONTENT")){
			//
			this.updateTextureCoreContent();
		}
		else if (this.links.some(l => l.type == "CODE_CLONE")){
			//
			this.updateTextureCodeDuplicated(this.links.find(l => l.type === "CODE_CLONE"));

		}
	}

	private updateTextureCoreContent() {
		this.mat.emissiveTexture = new Texture(
			`${Building3D.TEXTURE_PATH}/core_content.svg`,
			this.scene
		)
	}

	private updateTextureCodeDuplicated(link: Link3D) {
		const percentage = link.percentage ?? 0;
		const level = Math.floor(percentage / 100 * 7);
		this.applyCrackTextureForLevel(level, false, this.mat);
	}
}