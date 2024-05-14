import {Config} from '../../../model/entitiesImplems/config.model';
import {ActionManager, Color3, ExecuteCodeAction, MeshBuilder, Scene, StandardMaterial, Vector3, HighlightLayer} from '@babylonjs/core';
import {Element3D} from '../../common/3Dinterfaces/element3D.interface';
import { Building } from '../../../model/entities/building.interface';
import {Building3D} from '../../common/3Delements/building3D';
import {VPVariantsImplem} from "../../../model/entitiesImplems/vpVariantsImplem.model";
import { Building3DFactory } from "../../common/3Dfactory/building3D.factory";
import { FileBuilding3D } from '../../common/3Delements/file-building3D';
import { SelectedBuildingController } from "../../../controller/ui/selected-building.controller";
import { MenuController } from "../../../controller/ui/menu/menu.controller";
import { DetailsController } from "../../../controller/ui/menu/details.controller";
import { UIController } from '../../../controller/ui/ui.controller';



export class Road3D extends Element3D {
    padding: number = 0;

    // This is element that road is representing
    elementModel: VPVariantsImplem;

    // Roads
    leftVPs: Road3D[] = [];
    // Roads
    rightVPs: Road3D[] = [];

    // Building
    leftVariants: Building3D[] = [];
    // Building
    rightVariants: Building3D[] = [];

    classCityBuildings: Building3D[] = [];
    cloneCityBuildings: Building3D[] = [];

    // List of Buildings placed on top of File buildings (the classes buildings of Clone City)
    hatBuildings: Building3D[] = [];
    crownBuildings: Building3D[] = [];

    // This is the starting point of the road (the building with the pyramid on top).
    vp: Building3D;

    vector: Vector3;

    orientationX: number;
    orientationZ: number;

    roadWidth = 0.3;

    forcedLength: number = undefined;

    status: boolean = false;

    highlightForce: boolean
    highlightLayer: HighlightLayer;
    flag: boolean = false;

    constructor(scene: Scene, vpElmt: VPVariantsImplem, config: Config, name: string = "") {
        super(scene);

        this.elementModel = vpElmt;
        if (vpElmt && vpElmt.vp) {
            this.vp = new Building3D(scene, vpElmt.vp, 0, config);
        }

        if (vpElmt !== null && (vpElmt.name === undefined || vpElmt.name === "")) { // Add custom road for district main roads
            this.elementModel.name = name;
        }

        this.padding = config.district.padding;
    }

    /**
     * Spreads the buildings between the left part and the right part of the current road
     */
    private spreadElementsVariants(elements: Building3D[], left: Building3D[], right: Building3D[]): void {
        if (elements.length > 0) {
            const sorted = elements.sort((a, b) => {
                return (b.getWidth() - a.getWidth()) !== 0 ? b.getWidth() - a.getWidth() : (
                    b.getHeight() - a.getHeight()
                );
            });
            sorted.forEach((e) => {
                if (this.sumOfWidths(left) > this.sumOfWidths(right)) {
                    right.push(e);
                } else {
                    left.push(e);
                }
            });
        }
    }

    /**
     * Spreads the reads between the left part and the right part of the current road
     */
    private spreadElementsVP(elements: Road3D[], left: Road3D[], right: Road3D[]): void {
        if (elements.length > 0) {
            const sorted = elements.sort((a, b) => {
                if ((b.getWidth() - a.getWidth()) !== 0) return b.getWidth() - a.getWidth()          // Sort by width
                else if ((b.getLength() - a.getLength()) !== 0) return b.getLength() - a.getLength() // Then by length
                else return (b.getHeight() - a.getHeight())                                          // Finally by height
            });
            sorted.forEach((e) => {
                if (this.sumOfWidths(left) > this.sumOfWidths(right)) {
                    right.push(e);
                } else {
                    left.push(e);
                }
            });
        }
    }

    private sumOfWidths(list: Element3D[]): number {
        return list.reduce<number>((prev, cur) => prev + cur.getWidth(), 0);
    }

    /**
     *
     * @param right right side = true, left side = false
     *
     * @returns the width of the side
     */
    getSideWidth(right: boolean): number {
        if (right) { // right
            return Math.max(
                this.rightVPs.reduce(((a, b) => Math.max(a, b.getLength())), 0),
                this.rightVariants.reduce(((a, b) => Math.max(a, b.getLength())), 0),
                this.getVpWidth() / 2
            );
        } else { // left
            return Math.max(
                this.leftVPs.reduce(((a, b) => Math.max(a, b.getLength())), 0),
                this.leftVariants.reduce(((a, b) => Math.max(a, b.getLength())), 0),
                this.getVpWidth() / 2
            );
        }
    }

    getVpWidth(): number {
        return this.vp === undefined ? 0 : this.vp.getWidth();
    }

    getVpHeight(): number {
        return this.vp === undefined ? 0 : this.vp.getHeight();
    }

    getVpPadding(): number {
        return this.vp === undefined ? 0 : this.vp.padding;
    }

    getWidth(): number {
        return this.getSideWidth(true) + this.getSideWidth(false) + this.padding;
    }

    getLength(): number {
        if (this.forcedLength !== undefined) return this.forcedLength;

        return Math.max(
            this.leftVariants.reduce(((a, b) => a + b.getWidth()), 0),
            this.rightVariants.reduce(((a, b) => a + b.getWidth()), 0)
        ) + Math.max(
            this.leftVPs.reduce(((a, b) => a + b.getWidth()), 0),
            this.rightVPs.reduce(((a, b) => a + b.getWidth()), 0)
        ) + (this.getVpWidth()) + this.padding;
    }

    getHeight(): number {
        return Math.max(
            this.leftVPs.reduce((a, b) => Math.max(a, b.getHeight()), 0),
            this.rightVPs.reduce((a, b) => Math.max(a, b.getHeight()), 0),
            this.rightVariants.reduce((a, b) => Math.max(a, b.getHeight()), 0),
            this.leftVariants.reduce((a, b) => Math.max(a, b.getHeight()), 0),
            (this.vp === undefined ? 0 : this.vp.getHeight())
        )
    }

    get(name: string): Building3D {
        let building: Building3D = undefined;
        if (this.vp && this.vp.getName() === name) return this.vp;
        const arrConcat = this.leftVariants.concat(this.rightVariants);
        for (let b of this.crownBuildings) {
            if (b.getName() == name) {
                return b;
            }
        }
        for (let b of this.hatBuildings) {
            if (b.getName() == name) {
                return b;
            }
        }
        for (let b of arrConcat) {
            if (b.getName() == name) {
                return b;
            }
        }
        const roadsConcat = this.leftVPs.concat(this.rightVPs);
        for (let d of roadsConcat) {
            let b = d.get(name);
            if (b != undefined) {
                return b;
            }
        }
        return building;
    }

    getCrown(name: string): Building3D {
        for (let b of this.crownBuildings) {
            if (b.getName() == name) {
                return b;
            }
        }
    }

    private buildBuildings(config: Config) {
        const buildings3D: Building3D[] = [];
        this.elementModel.buildings.forEach(b => {
            if (config.blacklist) {
                if (!config.blacklist.some(blacklisted => b.name.includes(blacklisted))) {
                    if (config.clones) {
                        if (config.clones.map.has(b.name)) {
                            config.clones.map.get(b.name).clones.push(this.vp);
                        } else {
                            let d3 = Building3DFactory.createBuildingMesh(b, 0, this.scene, config);
                            config.clones.map.set(b.name, {original: d3, clones: []});
                            if (d3 instanceof FileBuilding3D) {
                                // files buildings are build here
                                let specificBuildings = d3.buildFile();
                                let hats = specificBuildings[0];
                                let crown = specificBuildings[1];
                                hats.forEach(building => {
                                    this.hatBuildings.push(building)
                                });
                                if (crown !== undefined) {
                                    this.crownBuildings.push(crown);
                                }
                            } else {
                                // Class buildings are build here
                                d3.build();
                            }
                            // d3.build();
                            buildings3D.push(d3);
                        }
                    } else {
                        let d3 = Building3DFactory.createBuildingMesh(b, 0, this.scene, config);
                        if (d3 instanceof FileBuilding3D) {
                            let specificBuildings = d3.buildFile();
                            console.log(specificBuildings);
                            let hats = specificBuildings[0];
                            let crown = specificBuildings[1];
                            hats.forEach(building => {
                                this.hatBuildings.push(building)
                            });
                            if (crown !== undefined) {
                                this.crownBuildings.push(crown);
                            }
                        } else {
                            d3.build();
                        }                        
                        buildings3D.push(d3);                      
                    }
                }
            }
        });
        return buildings3D;
    }

    private buildRoads(config: Config) {
        const roads3D: Road3D[] = [];
        this.elementModel.districts.forEach(v => {
            if (config.blacklist) {
                if (!config.blacklist.some(blacklisted => v.name.includes(blacklisted))) {
                    if (config.clones) {
                        if (config.clones.map.has(v.vp.name)) {
                            config.clones.map.get(v.vp.name).clones.push(this.vp);
                        } else {
                            let d3 = new Road3D(this.scene, v, config);
                            config.clones.map.set(v.vp.name, {original: d3.vp, clones: []});
                            d3.build(config);
                            roads3D.push(d3);
                        }
                    } else {
                        let d3 = new Road3D(this.scene, v, config);
                        d3.build(config);
                        roads3D.push(d3);
                    }
                }
            }
        });
        return roads3D;
    }

    build(config?: Config) {
        if (this.forcedLength !== undefined) return;

        if (this.vp) {
            this.vp.build();
        }
        const buildings3D: Building3D[] = this.buildBuildings(config);
        const roads3D: Road3D[] = this.buildRoads(config);

        this.spreadElementsVariants(buildings3D, this.leftVariants, this.rightVariants);
        this.spreadElementsVP(roads3D, this.leftVPs, this.rightVPs);
    }

    getRoadLength(): number {
        return this.getLength() - this.getVpWidth();
    }

    place(x: number, z: number, orientationX: number, orientationZ: number) {
        this.orientationX = orientationX;
        this.orientationZ = orientationZ;

        if (this.vp) this.vp.place(x, z);
        
        this.vector = new Vector3(
            x + orientationX * (this.getRoadLength() / 2 + this.getVpWidth() / 2 - this.getVpPadding() / 2),
            0,
            z + orientationZ * (this.getRoadLength() / 2 + this.getVpWidth() / 2 - this.getVpPadding() / 2)
        );

        let offsetVL = this.getVpWidth() / 2; // to start drawing VPs
        let offsetVR = this.getVpWidth() / 2;
        let vX = 0;
        let vZ = 0;
        this.leftVPs.forEach(e => {
            if (e.vp.elementModel.types.includes("DIRECTORY")) {
                vX =
                /* horizontal case: */ (e.getSideWidth(false) + offsetVL) * orientationX +
                /* vertical case:   */ (e.getVpWidth() / 2 - (e.vp.padding * 1.5)  + this.roadWidth / 2) * -orientationZ;
                vZ =
                /* horizontal case: */ (e.getVpWidth() / 2 - (e.vp.padding * 1.5)  + this.roadWidth / 2) * orientationX +
                /* vertical case:   */ (e.getSideWidth(false) + offsetVL) * orientationZ;
            } else {
                vX =
                /* horizontal case: */ (e.getSideWidth(false) + offsetVL) * orientationX +
                /* vertical case:   */ (e.getVpWidth() / 2 - e.vp.padding / 2  + this.roadWidth / 2) * -orientationZ;
                vZ =
                /* horizontal case: */ (e.getVpWidth() / 2 - e.vp.padding / 2  + this.roadWidth / 2) * orientationX +
                /* vertical case:   */ (e.getSideWidth(false) + offsetVL) * orientationZ;
            }



            e.place(vX + x, vZ + z, -orientationZ, orientationX);
            offsetVL += e.getWidth() + 0.2;
        });
        this.rightVPs.forEach(e => {
            if (e.vp.elementModel.types.includes("DIRECTORY")) {
                vX =
                /* horizontal case: */ (e.getSideWidth(true) + offsetVR) * orientationX +
                /* vertical case:   */ (e.getVpWidth() / 2 - (e.vp.padding * 1.5)+ this.roadWidth / 2) * orientationZ;
                vZ =
                    /* horizontal case: */ -(e.getVpWidth() / 2 - (e.vp.padding * 1.5)+ this.roadWidth / 2) * orientationX +
                    /* vertical case:   */ (e.getSideWidth(true) + offsetVR) * orientationZ;
            } else {
                vX =
                /* horizontal case: */ (e.getSideWidth(true) + offsetVR) * orientationX +
                /* vertical case:   */ (e.getVpWidth() / 2 - e.vp.padding / 2 + this.roadWidth / 2) * orientationZ;
                vZ =
                    /* horizontal case: */ -(e.getVpWidth() / 2 - e.vp.padding / 2 + this.roadWidth / 2) * orientationX +
                    /* vertical case:   */ (e.getSideWidth(true) + offsetVR) * orientationZ;

            }
            e.place(vX + x, vZ + z, orientationZ, -orientationX);
            offsetVR += e.getWidth() + 0.2;
        });

        let offsetL = Math.max(offsetVL, offsetVR);
        let offsetR = Math.max(offsetVL, offsetVR);

        this.leftVariants.forEach(e => {
            let vX =
                /* horizontal case: */ ((e.getWidth() / 2) + offsetL) * orientationX +
                /* vertical case:   */ (e.getWidth() / 2 - e.padding / 2 + this.roadWidth / 2) * -orientationZ;
            let vZ =
                /* horizontal case: */ (e.getWidth() / 2 - e.padding / 2 + this.roadWidth / 2) * orientationX +
                /* vertical case:   */ (e.getWidth() / 2 + offsetL) * orientationZ
            e.place(vX + x, vZ + z);
            offsetL += e.getWidth();
        });

        this.rightVariants.forEach(e => {
            let vX =
                /* horizontal case: */ ((e.getWidth() / 2) + offsetR) * orientationX -
                /* vertical case:   */ (e.getWidth() / 2 - e.padding / 2 + this.roadWidth / 2) * -orientationZ;
            let vZ =
                /* horizontal case: */ -(e.getWidth() / 2 - e.padding / 2 + this.roadWidth / 2) * orientationX +
                /* vertical case:   */ ((e.getWidth()) / 2 + offsetR) * orientationZ
            e.place(vX + x, vZ + z);
            offsetR += e.getWidth();
        });
    }

    private getMeshName(): string {
        return this.elementModel ? this.elementModel.name : "Highway to Hell";
    }

    render(config: Config) {
        this.d3Model = MeshBuilder.CreateBox(
            this.getMeshName(),
            {
                height: 0.001,
                width: (this.orientationX == 0 ? this.roadWidth : this.getRoadLength()),
                depth: (this.orientationZ == 0 ? this.roadWidth : this.getRoadLength())
            },
            this.scene);
        this.d3Model.setPositionWithLocalVector(this.vector);

        let mat = new StandardMaterial("District", this.scene);
        // if config -> district -> colors -> faces is defined
        if (config.district.colors.faces) {
            if (this.vp) {
                if (this.vp.elementModel.types.includes("DIRECTORY")) {
                    // const folderRoadColor = config.district.colors.faces.filter(c => c.name === "FOLDER");
                    const folderColor = this.vp.getColor(config.fnf_base.colors.base, this.vp.elementModel.types)
                    if (folderColor !== undefined) {
                        mat.ambientColor = Color3.FromHexString(folderColor);
                        mat.diffuseColor = Color3.FromHexString(folderColor);
                        mat.emissiveColor = Color3.FromHexString(folderColor);
                        mat.specularColor = Color3.FromHexString("#000000");
                    } else {
                        const defaultVPColor = "#FFFFFF";
                        mat.ambientColor = Color3.FromHexString(defaultVPColor);
                        mat.diffuseColor = Color3.FromHexString(defaultVPColor);
                        mat.emissiveColor = Color3.FromHexString(defaultVPColor);
                        mat.specularColor = Color3.FromHexString("#000000");
                    }
                } else {
                    const vPColors = config.district.colors.faces.filter(c => c.name === "VP");
                    if (vPColors.length > 0) {
                        mat.ambientColor = Color3.FromHexString(vPColors[0].color);
                        mat.diffuseColor = Color3.FromHexString(vPColors[0].color);
                        mat.emissiveColor = Color3.FromHexString(vPColors[0].color);
                        mat.specularColor = Color3.FromHexString("#000000");
                    } else {
                        const defaultVPColor = "#FFFFFF";
                        mat.ambientColor = Color3.FromHexString(defaultVPColor);
                        mat.diffuseColor = Color3.FromHexString(defaultVPColor);
                        mat.emissiveColor = Color3.FromHexString(defaultVPColor);
                        mat.specularColor = Color3.FromHexString("#000000");
                    } 
                } 
            } else {
                const pacColors = config.district.colors.faces.filter(c => c.name === "PACKAGE");
                if (pacColors.length > 0) {
                    mat.ambientColor = Color3.FromHexString(pacColors[0].color);
                    mat.diffuseColor = Color3.FromHexString(pacColors[0].color);
                    mat.emissiveColor = Color3.FromHexString(pacColors[0].color);
                    mat.specularColor = Color3.FromHexString("#000000");
                } else {
                    const defaultPacColor = "#000000";
                    mat.ambientColor = Color3.FromHexString(defaultPacColor);
                    mat.diffuseColor = Color3.FromHexString(defaultPacColor);
                    mat.emissiveColor = Color3.FromHexString(defaultPacColor);
                    mat.specularColor = Color3.FromHexString("#000000");
                }
            }
        }

        this.d3Model.material = mat;
        this.d3Model.actionManager = new ActionManager(this.scene);


        if (this.vp) {
            if (!this.vp.elementModel.types.includes("DIRECTORY")) {
                this.vp.render();
            } 
            // here action manager for road, but break movement
            // else {
            //     this.d3Model.actionManager.registerAction(
            //         new ExecuteCodeAction(
            //             {
            //                 trigger: ActionManager.OnPointerOverTrigger
            //             },
            //             () => {
            //                 this.highlight(true);
            //                 if (SelectedBuildingController.selected.length == 0) {
            //                     UIController.displayObjectInfo(this.vp);
            //                 }
            //             }
            //         )
            //     );
            //     this.d3Model.actionManager.registerAction(
            //         new ExecuteCodeAction(
            //             {
            //                 trigger: ActionManager.OnPointerOutTrigger
            //             },
            //             () => {
            //                 this.highlight(false);
            //             }
            //         )
            //     );
            //     this.d3Model.actionManager.registerAction(
            //         new ExecuteCodeAction(
            //             {
            //                 trigger: ActionManager.OnPickTrigger
            //             },
            //             () => {
            //                 this.flag = !this.flag;
            //                 this.selectAndDisplayDetails(this.flag, this.flag);
            //             }
            //         )
            //     );
            // }
        } 

        const variants = this.leftVariants.concat(this.rightVariants);
        variants.forEach(d => {
            d.render();
        });

        const vps = this.leftVPs.concat(this.rightVPs);
        vps.forEach(b => {
            b.render(config);
        });

        this.d3Model.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnLeftPickTrigger
                },
                () => {
                    this.showAllLinks();
                }
            )
        );
        
    }

    showAllLinks(status?: boolean) {
        if (status) this.status = status;
        else this.status = !this.status;
        if (this.vp) this.vp.showAllLinks(this.status);

        const variants = this.leftVariants.concat(this.rightVariants);
        variants.forEach(v => {
            v.showAllLinks(this.status);
        });

        const vps = this.leftVPs.concat(this.rightVPs);
        vps.forEach(vp => {
            vp.showAllLinks(this.status);
        });
    }

    highlight(arg: boolean, force: boolean = false) {
        if (force) this.highlightForce = arg;
        if (!arg && !this.highlightForce) {
            this.highlightLayer.removeAllMeshes();
        } else {
            this.highlightLayer.addMesh(this.d3Model, Color3.Purple());
        }
    }

    protected selectAndDisplayDetails(flag, openInfo: boolean = true, element: Building = this.vp.elementModel) {
        if (flag) {
            SelectedBuildingController.selectABuilding(element);
        } else {
            SelectedBuildingController.unselectABuilding(element);
        }

        // Highlight the building.
        this.highlight(flag, true);

        if (openInfo) {
            // Display the submenu.
            document.getElementById("submenu").style.display = "block";

            // Deselect the current tab.
            const infoTab = DetailsController.getInformationTab();
            if (MenuController.selectedTab && MenuController.selectedTab !== infoTab) {
                const currentTab = document.getElementById(MenuController.selectedTab.id)
                MenuController.changeImage(currentTab) // Remove tab icon except if Information tab
            }

            // Select the information tab.
            if (!MenuController.selectedTab || MenuController.selectedTab !== infoTab) {
                MenuController.changeImage(infoTab) // Set Information tab icon to selected
            }
            MenuController.selectedTab = infoTab;
        } else {
            MenuController.closeMenu();
        }

        // Update the object information.
        UIController.displayObjectInfo(this.vp, flag ? flag : undefined);
    }

    // protected setupActionManager() {
    //     this.d3Model.actionManager = new ActionManager(this.scene);

    //     this.d3Model.actionManager.registerAction(
    //         new ExecuteCodeAction(
    //             {
    //                 trigger: ActionManager.OnPointerOverTrigger
    //             },
    //             () => {
    //                 this.highlight(true);
    //                 if (SelectedBuildingController.selected.length == 0) {
    //                     UIController.displayObjectInfo(this.vp);
    //                 }
    //             }
    //         )
    //     );
    //     this.d3Model.actionManager.registerAction(
    //         new ExecuteCodeAction(
    //             {
    //                 trigger: ActionManager.OnPointerOutTrigger
    //             },
    //             () => {
    //                 this.highlight(false);
    //             }
    //         )
    //     );
    //     this.d3Model.actionManager.registerAction(
    //         new ExecuteCodeAction(
    //             {
    //                 trigger: ActionManager.OnPickTrigger
    //             },
    //             () => {
    //                 this.flag = !this.flag;
    //                 this.selectAndDisplayDetails(this.flag, this.flag);
    //             }
    //         )
    //     )
    // }
}