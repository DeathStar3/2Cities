import { Element3D } from './element3D.interface';
import { Color3, Color4, StandardMaterial } from '@babylonjs/core';
import { Building3D } from './building3D';
import { Scene } from '@babylonjs/core';
import { Mesh, MeshBuilder, Vector3 } from '@babylonjs/core';
import { District } from '../../model/entities/district.interface';

export class District3D implements Element3D {
    elementModel: District;
    scene: Scene;
    depth: number;

    d3Model: Mesh;
    x = 0;
    z = 0;
    vector: Vector3;

    size = 0;

    padding: number = 5;

    d3Buildings: Building3D[] = [];
    d3Districts: District3D[] = [];

    constructor(scene: Scene, element: District, depth: number) {
        this.scene = scene;
        this.depth = depth;
        this.elementModel = element;
        // this.x = x;
        // this.z = z;
    }

    resize(placements: number[][], width: number): number[][] {
        let currentRow = 0;
        let currentLength = 0;
        let result = [[]];
        for (let i = 0; i < placements.length; i++) {
            for (let j = 0; j < placements[i].length; j++) {
                if (currentLength + placements[i][j] > width) {
                    currentRow++;
                    currentLength = 0;
                    result.push([]);
                }
                result[currentRow].push(placements[i][j]);
                currentLength += placements[i][j];
            }
        }
        return result;
    }

    calculateSize(sizesArray: number[]): number {
        let placements = [[]];
        placements[0][0] = sizesArray[0];
        let currentWidth = sizesArray[0];
        let currentRow = 0;
        for (let i = 1; i < sizesArray.length; i++) {
            if (sizesArray[i] + placements[currentRow].reduce((prev, curr) => prev += curr, 0) > currentWidth) {
                if (i == 1) {// si c'est le 2ème élément qu'on ajoute
                    placements.push([]);
                    currentWidth += sizesArray[1];
                    placements[0][1] = sizesArray[1];
                    currentRow = 1;
                }
                else { // sinon
                    if (sizesArray[i] + placements.reduce<number>((prev, cur) => prev += cur[0], 0) > currentWidth) { // si on dépasse la height aussi alors il faut resize
                        currentWidth += placements[0][1];
                        placements = this.resize(placements, currentWidth);
                        currentRow = placements.length - 1;
                    } else { // sinon on ajoute à la ligne suivante
                        currentRow++;
                    }
                    if (!placements[currentRow]) {
                        placements.push([]);
                    }
                    placements[currentRow].push(sizesArray[i]);
                }
            } else {
                placements[currentRow].push(sizesArray[i]);
            }
        }
        return currentWidth;
    }

    getSize(): number {
        let modelsWithsSizes: number[] = [];
        this.d3Districts.forEach(d => modelsWithsSizes.push(d.getSize()))
        this.d3Buildings.forEach(b => modelsWithsSizes.push(b.getSize()))
        // return (this.calculateSize(modelsWithsSizes.sort((a, b) => b - a))); // algo qui calcule size du district en fonction des éléments alain térieur
        return (this.calculateSize(modelsWithsSizes.sort((a, b) => b - a)) + this.padding); // algo qui calcule size du district en fonction des éléments alain térieur
    }

    get(name: string): Building3D {
        let building: Building3D = undefined;
        if (name.includes(this.elementModel.name)) {
            for (let b of this.d3Buildings) {
                if (b.getName() == name) {
                    return building = b;
                }
            }
            for (let d of this.d3Districts) {
                let b = d.get(name);
                if (b != undefined) {
                    return building = b;
                };
            }
        } else {
            return building;
        }
        return building;
    }

    build() {
        this.elementModel.districts.forEach(d => {
            let d3District = new District3D(this.scene, d, this.depth + 1)
            this.d3Districts.push(d3District);
            d3District.build();
        });

        this.elementModel.buildings.forEach(b => {
            let d3Building = new Building3D(this.scene, b, this.depth);
            this.d3Buildings.push(d3Building);
            d3Building.build();
        });
    }

    place(x: number, z: number): void {
        let d3elements: Element3D[] = []
        d3elements = d3elements.concat(this.d3Districts, this.d3Buildings);
        d3elements = d3elements.sort((a, b) => b.getSize() - a.getSize());
        let currentX: number = 0;
        let currentZ: number = 0;
        let nextZ = 0;
        this.size = this.getSize();
        console.log("name: " + this.elementModel.name + "\nsize: " + this.size + "\t\tx: " + x + "\t\tz: " + z);
        this.vector = new Vector3(x + this.size / 2 , 30 * this.depth - 15, z + this.size / 2);
        // this.vector = new Vector3(x + this.size / 2 + this.padding / 2, 30 * this.depth - 15, z + this.size / 2 + this.padding / 2);
        d3elements.forEach(e => {
            let eSize = e.getSize();
            if (currentX + eSize > this.size) {
                currentX = 0;
                currentZ = nextZ;
            }
            if (currentX === 0) {
                // nextZ += eSize;
                nextZ += eSize + this.padding / 2;
            }
            // e.place(x + currentX, z + currentZ);
            // currentX += eSize;
            e.place(x + currentX + this.padding / 2, z + currentZ + this.padding / 2);
            currentX += eSize + this.padding / 2;
        });
    }

    render(config: any) {
        this.d3Model = MeshBuilder.CreateBox(
            "package",
            {
                height: 30,
                width: this.size - this.padding,
                depth: this.size - this.padding
            },
            this.scene);
        this.d3Model.setPositionWithLocalVector(this.vector);//new Vector3(this.x + (this.elementModel.getTotalWidth() / 2), 30 * this.depth - 15, this.z));

        // if config -> district -> colors -> outline is defined
        if (config.district.colors.outline) {
            this.d3Model.renderOutline = true;
            this.d3Model.outlineColor = Color3.FromHexString(config.district.colors.outline);
        } else {
            console.log("outline not defined");
        }

        // if config -> district -> colors -> edges is defined
        if (config.district.colors.edges) {
            this.d3Model.outlineWidth = 0.1;
            this.d3Model.edgesColor = Color4.FromHexString(config.district.colors.edges);
        } else {
            console.log("edges not defined");
        }

        let mat = new StandardMaterial("District", this.scene);
        // if config -> district -> colors -> faces is defined
        if (config.district.colors.faces) {
            mat.ambientColor = Color3.FromHexString(config.district.colors.faces[0].color);
            mat.diffuseColor = Color3.FromHexString(config.district.colors.faces[0].color);
            mat.emissiveColor = Color3.FromHexString(config.district.colors.faces[0].color);
            mat.specularColor = Color3.FromHexString("#000000");
        } else {
            console.log("faces not defined");
        }
        this.d3Model.material = mat;

        this.d3Districts.forEach(d => {
            d.render(config);
        });

        this.d3Buildings.forEach(b => {
            b.render(config);
        });
    }
}