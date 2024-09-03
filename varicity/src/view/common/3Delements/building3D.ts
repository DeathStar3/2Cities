import { UIController } from '../../../controller/ui/ui.controller';
import { Config, MetricSpec } from '../../../model/entitiesImplems/config.model';
import { Element3D } from '../3Dinterfaces/element3D.interface';
import {
    ActionManager,
    Color3,
    Color4,
    ExecuteCodeAction,
    HighlightLayer,
    Mesh,
    MeshBuilder,
    Scene,
    StandardMaterial,
    Texture,
    Vector3
} from '@babylonjs/core';
import { Building } from '../../../model/entities/building.interface';
import { Link3D } from '../3Dinterfaces/link3D.interface';
import { MenuController } from "../../../controller/ui/menu/menu.controller";
import { SceneRenderer } from "../../sceneRenderer";
import { DetailsController } from "../../../controller/ui/menu/details.controller";
import { SelectedBuildingController } from "../../../controller/ui/selected-building.controller";

export class Building3D extends Element3D {
    public static readonly TEXTURE_PATH: string = "./images/visualization-texture";

    elementModel: Building;

    depth: number;

    center: Vector3;
    top: Vector3;
    bot: Vector3;

    d3ModelOutline: Mesh;
    d3ModelPyramid: Mesh = undefined;
    d3ModelChimney1: Mesh = undefined;
    d3ModelChimney2: Mesh = undefined;
    d3ModelChimney3: Mesh = undefined;
    d3ModelPrism: Mesh = undefined;
    d3ModelInvertedPyramid: Mesh = undefined;
    d3ModelSphere: Mesh = undefined;
    d3ModelShade: Mesh = undefined;

    links: Link3D[] = [];

    padding = 0.2;
    heightScale = 0.3;
    outlineWidth = 0.05;

    edgesWidth: number = 1.0;

    highlightLayer: HighlightLayer;
    highlightForce: boolean;

    focusScaleForce: boolean;

    config: Config;

    flag: boolean = false;

    protected mat: StandardMaterial;

    private crownConstanteSize: number = 3;

    constructor(scene: Scene, buildingElement: Building, depth: number, config: Config) {
        super(scene);
        this.elementModel = buildingElement;
        this.depth = depth;
        this.config = config;
        this.padding = config.building.padding;
    }

    showAllLinks(status?: boolean) {
        if (status == undefined) this.links.forEach(l => l.display());
        else this.links.forEach(l => l.display(status));
    }

    getWidth(): number {
        return this.elementModel.getWidth(this.config.variables.width) + this.padding; // 2.5 av 2.5 ap
        // return this.elementModel.getWidth();// 2.5 av 2.5 ap
    }

    getLength(): number {
        return this.getWidth();
    }

    getHeight(): number {
        return this.elementModel.types.includes("CROWN") ? this.elementModel.getHeight(this.config.variables.height) : this.elementModel.getHeight(this.config.variables.height) * this.heightScale;
    }

    getName() {
        return this.elementModel.name;
    }

    link(link: Link3D) {
        this.links.push(link);
    }

    highlight(arg: boolean, force: boolean = false) {
        if (force) this.highlightForce = arg;
        if (!arg && !this.highlightForce) {
            this.highlightLayer.removeAllMeshes();
        } else {
            this.highlightLayer.addMesh(this.d3Model, Color3.Purple());
        }
    }

    focus(openInfo: boolean = true) {
        let cam = SceneRenderer.camera;
        cam.focusOn([this.d3Model], true);
        cam.radius = 20;

        this.flag = true;
        this.selectAndDisplayDetails(this.flag, openInfo);
    }

    protected selectAndDisplayDetails(flag, openInfo: boolean = true, element: Building = this.elementModel) {
        if (flag) {
            SelectedBuildingController.selectABuilding(element);
        } else {
            SelectedBuildingController.unselectABuilding(element);
        }

        // Highlight the building.
        this.highlight(flag, true);

        // Display the links.
        console.log("[Building ", element.name, "] Links: ", this.links)
        this.links.forEach(l => {
            if (l.type === "BRIDGE") {
                if (l.src == this) {
                    l.dest.highlight(flag, true);
                    l.dest.links.forEach(link => link.display(flag, flag));
                } else {
                    l.src.highlight(true);
                    l.src.links.forEach(link => link.display(flag, flag));
                }
            } else if (l.type === "CODE_CLONE") {
                if (l.src == this) {
                    l.dest.highlight(flag, true);
                } else {
                    l.src.highlight(true);
                }
            }
            l.display(flag, flag);
        });

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
        UIController.displayObjectInfo(this, flag ? flag : undefined);
    }

    build() {
        // No need for build phase
    }

    place(x: number, z: number) {
        const increaseHeight = ["API", "FACTORY", "DECORATOR", "TEMPLATE", "STRATEGY", "CLONED"];
        let halfHeight = this.getHeight() / 2;
        this.center = new Vector3(x, halfHeight + this.depth * 30, z);
        this.bot = this.center.add(new Vector3(0, -halfHeight, 0));

        this.elementModel.types.forEach(t => {
            if (increaseHeight.includes(t)) {
                halfHeight += this.getWidth() - this.padding;
            }
        });
        this.top = this.center.add(new Vector3(0, halfHeight, 0));
    }

    /**
     * Create the base mesh for the current element (cylinder if it is a file, a box for a class)
     */
    protected renderBaseElement(
        scale: number = 1,
        sideOrientation: number = Mesh.DEFAULTSIDE,
        updatable: boolean = false
    ): Mesh {
        // if (this.elementModel.types.includes("CROWN")) {
        //     return MeshBuilder.CreateCylinder(
        //         this.elementModel.name,
        //         {
        //             // height: this.crownConstanteSize + this.elementModel.metrics.getMetricValue("nbClones"), // Here to change the default size of the mesh
        //             // height: this.getHeight() + (this.elementModel.metrics.getMetricValue("nbClones") / 2),
        //             height: this.elementModel.metrics.getMetricValue("nbClones") / 2,
        //             diameter: this.elementModel.getWidth(this.config.variables.width) * scale,
        //             sideOrientation: sideOrientation,
        //             updatable: updatable
        //         },
        //         this.scene);
        // }
        if (this.elementModel.types.includes("FILE") || this.elementModel.types.includes("DIRECTORY")) { // creation of folder cylinder here
            return MeshBuilder.CreateCylinder(
                this.elementModel.name,
                {
                    height: this.getHeight(),
                    diameter: this.elementModel.getWidth(this.config.variables.width) * scale,
                    sideOrientation: sideOrientation,
                    updatable: updatable
                },
                this.scene);
        } else {
            return MeshBuilder.CreateBox(
                this.elementModel.name,
                {
                    height: this.getHeight(),
                    width: this.elementModel.getWidth(this.config.variables.width) * scale,
                    depth: this.elementModel.getWidth(this.config.variables.width) * scale,
                    sideOrientation: sideOrientation,
                    updatable: updatable
                },
                this.scene);
        }
    }

    /**
     * Render outline element if needed
     */
    private renderOutlineElement(scale: number = 1) {
        // if config -> building -> colors -> outline is defined
        if (this.config.building.colors.outlines) {
            const outlineColor = this.getColor(this.config.building.colors.outlines, this.elementModel.types);
            if (outlineColor !== undefined) {
                this.d3ModelOutline = this.renderBaseElement(scale, Mesh.BACKSIDE);

                let outlineMat = new StandardMaterial('outlineMaterial', this.scene);
                this.d3ModelOutline.material = outlineMat;
                this.d3ModelOutline.parent = this.d3Model;
                outlineMat.diffuseColor = Color3.FromHexString(outlineColor);
                outlineMat.emissiveColor = Color3.FromHexString(outlineColor);
            } else {
                this.d3Model.renderOutline = false;
            }
        } else {
            this.d3Model.renderOutline = false;
        }
    }

    /**
     * Create the default material to apply on the mesh
     */
    private createDefaultMaterial() {
        let mat = new StandardMaterial(this.elementModel.name + "Mat", this.scene);

        if (!this.elementModel.types.includes("BRIDGED")) {
            mat.ambientColor = Color3.FromHexString(this.config.force_color);
            mat.diffuseColor = Color3.FromHexString(this.config.force_color);
            mat.emissiveColor = Color3.FromHexString(this.config.force_color);
            mat.specularColor = Color3.FromHexString("#000000");
        } else {
            if (this.config.building.colors.faces) {
                const buildingColor = this.getColor(this.config.building.colors.faces, this.elementModel.types);
                if (buildingColor !== undefined) {
                    mat.ambientColor = Color3.FromHexString(buildingColor);
                    mat.diffuseColor = Color3.FromHexString(buildingColor);
                    mat.emissiveColor = Color3.FromHexString(buildingColor);
                    mat.specularColor = Color3.FromHexString("#000000");
                } else {
                    mat.ambientColor = new Color3(1, 0, 0);
                    mat.diffuseColor = new Color3(1, 0, 0);
                    mat.emissiveColor = new Color3(1, 0, 0);
                    mat.specularColor = new Color3(0, 0, 0);
                }
            }
        }

        return mat;
    }

    private createDirectoryDefaultMaterial() {
        let mat = new StandardMaterial(this.elementModel.name + "Mat", this.scene);

        if (this.config.fnf_base.colors.base) {
            const baseColor = this.getColor(this.config.fnf_base.colors.base, this.elementModel.types)
            if (baseColor !== undefined) {
                mat.ambientColor = Color3.FromHexString(baseColor);
                mat.diffuseColor = Color3.FromHexString(baseColor);
                mat.emissiveColor = Color3.FromHexString(baseColor);
                mat.specularColor = Color3.FromHexString("#000000");
            } else {
                mat.ambientColor = new Color3(0, 1, 0);
                mat.diffuseColor = new Color3(0, 1, 0);
                mat.emissiveColor = new Color3(0, 1, 0);
                mat.specularColor = new Color3(0, 0, 0);
            }
        } else {
            mat.ambientColor = new Color3(1, 0, 0);
            mat.diffuseColor = new Color3(1, 0, 0);
            mat.emissiveColor = new Color3(1, 0, 0);
            mat.specularColor = new Color3(0, 0, 0);
        }
        return mat;
    }

    private createVariantFileMaterial() {
        let mat = new StandardMaterial(this.elementModel.name + "Mat", this.scene);

        if (this.elementModel.variantFileColor !== undefined) {
            let baseColor = this.elementModel.variantFileColor;
            mat.ambientColor = Color3.FromHexString(baseColor);
            mat.diffuseColor = Color3.FromHexString(baseColor);
            mat.emissiveColor = Color3.FromHexString(baseColor);
            mat.specularColor = Color3.FromHexString("#000000");
        }
        else if (this.config.fnf_base.colors.base) {
            const baseColor = this.getColor(this.config.fnf_base.colors.base, this.elementModel.types)
            if (baseColor !== undefined) {
                mat.ambientColor = Color3.FromHexString(baseColor);
                mat.diffuseColor = Color3.FromHexString(baseColor);
                mat.emissiveColor = Color3.FromHexString(baseColor);
                mat.specularColor = Color3.FromHexString("#000000");
            } else {
                mat.ambientColor = new Color3(0, 1, 0);
                mat.diffuseColor = new Color3(0, 1, 0);
                mat.emissiveColor = new Color3(0, 1, 0);
                mat.specularColor = new Color3(0, 0, 0);
            }
        } else {
            mat.ambientColor = new Color3(1, 0, 0);
            mat.diffuseColor = new Color3(1, 0, 0);
            mat.emissiveColor = new Color3(1, 0, 0);
            mat.specularColor = new Color3(0, 0, 0);
        }
        return mat
    }

    private displayMetricByCityFade(mat: StandardMaterial) {
        if (this.config.variables.fade && this.config.variables.fade != "") {
            if (this.elementModel.metrics.metrics.has(this.config.variables.fade)) { //Check if the metric wanted exist
                const metricValue = this.elementModel.metrics.metrics.get(this.config.variables.fade).value;

                const configSpec = UIController.config.metrics.get(this.config.variables.fade) || new MetricSpec();
                let fade = this.normalize(metricValue, configSpec.max, configSpec.min, 0, 1);
                if (configSpec.higherIsBetter) {
                    fade = 1 - fade;
                }

                let hue = ((1 - fade) * 120);
                let rgb = this.hsl2Rgb(Math.max(hue / 360, 0), 1, 0.5);

                mat.emissiveColor = new Color3(rgb[0], rgb[1], rgb[2])
                mat.diffuseColor = new Color3(rgb[0] / 2, rgb[1] / 2, rgb[2] / 2)
                mat.ambientColor = new Color3(0, 0, 0)
            } else {
                mat.ambientColor = Color3.FromHexString("#555555");
                mat.diffuseColor = Color3.FromHexString("#555555");
                mat.emissiveColor = Color3.FromHexString("#555555");
            }
        }
    }

    private displayMetricByOpacity(mat: StandardMaterial) {
        if (this.config.variables.intensity && this.config.variables.intensity != "") {
            if (this.elementModel.metrics.metrics.has(this.config.variables.intensity)) { //Check if the metric wanted exist
                const metricValue = this.elementModel.metrics.metrics.get(this.config.variables.intensity).value;

                const configSpec = UIController.config.metrics.get(this.config.variables.intensity) || new MetricSpec();
                let intensity = 1 - this.normalize(metricValue, configSpec.max, configSpec.min, 0, 0.93);
                if (configSpec.higherIsBetter) {
                    intensity = 1 - intensity;
                }

                let hsv = this.rgb2Hsv(mat.emissiveColor.r, mat.emissiveColor.g, mat.emissiveColor.b)
                let rgb = this.hsv2Rgb(hsv[0], hsv[1], intensity)

                mat.ambientColor = new Color3(rgb[0], rgb[1], rgb[2])
                mat.diffuseColor = new Color3(rgb[0], rgb[1], rgb[2])
                mat.emissiveColor = new Color3(rgb[0], rgb[1], rgb[2])
            }
        }
    }

    /**
     * source: https://betterprogramming.pub/generate-contrasting-text-for-your-random-background-color-ac302dc87b4
     */
    private rgbToYIQ(r, g, b): number {
        return ((r * 299) + (g * 587) + (b * 114)) / 1000;
    }

    /**
     * Apply a crack texture on the mesh
     *
     * @param level         A value between 0 and 7
     * @param isWhiteColor  Is the display color white?
     * @param mat           The material that is applied on the mesh
     * @protected
     */
    protected applyCrackTextureForLevel(level: number, isWhiteColor: boolean, mat: StandardMaterial) {
        level = Math.max(1, Math.min(7, level)); // Level is bound between 0 and
        let color = isWhiteColor ? 'w_' : '';

        mat.diffuseTexture = new Texture(
            `${Building3D.TEXTURE_PATH}/crack/${color}level${level}.png`,
            this.scene
        );
        if (isWhiteColor)
            mat.emissiveTexture = new Texture(
                `${Building3D.TEXTURE_PATH}/crack/${color}level${level}_black.png`,
                this.scene
            );
    }

    private displayMetricByCrack(mat: StandardMaterial) {
        if (this.config.variables.crack && this.config.variables.crack !== "") {
            console.log("this.config.variables.crack", this.config.variables.crack);

            // White color is absorbed find how to fix it:
            // See Spike #81 https://github.com/DeathStar3-projects/varicity-config/issues/81
            let isWhiteColor = (this.rgbToYIQ(mat.emissiveColor.r, mat.emissiveColor.g, mat.emissiveColor.b) <= 0.2);
            let color = isWhiteColor ? "w_" : "";

            if (this.elementModel.metrics.metrics.has(this.config.variables.crack)) { //Check if the metric wanted exist
                const metricValue = this.elementModel.metrics.metrics.get(this.config.variables.crack).value;

                const configSpec = UIController.config.metrics.get(this.config.variables.crack) || new MetricSpec();
                let crack = this.normalize(metricValue, configSpec.max, configSpec.min, 0, 1);
                if (configSpec.higherIsBetter) {
                    crack = 1 - crack;
                }

                const numberOfLevels = 8;
                const level = Math.floor(crack * numberOfLevels);
                this.applyCrackTextureForLevel(level, isWhiteColor, mat);
            } else {
                mat.diffuseTexture = new Texture("./images/visualization-texture/crack/" + color + "cross_3.png", this.scene);
                if (isWhiteColor) {
                    mat.emissiveTexture = new Texture("./images/visualization-texture/crack/" + color + "cross_3_black.png", this.scene);
                }
            }
        }
    }

    protected renderEdges() {
        this.d3Model.enableEdgesRendering();
        this.d3Model.edgesWidth = this.edgesWidth;

        let hsv = this.rgb2Hsv(this.mat.emissiveColor.r, this.mat.emissiveColor.g, this.mat.emissiveColor.b)
        let rgb = this.hsv2Rgb(hsv[0], hsv[1], Math.max(hsv[2] - 0.2, 0))
        this.d3Model.edgesColor = new Color4(rgb[0], rgb[1], rgb[2], 1)
    }

    /**
     * These are the three action between mouse and buildings
     * Pointer over, Pointer out and select
     */
    protected setupActionManager() {
        this.d3Model.actionManager = new ActionManager(this.scene);

        UIController.addEntry(this.getName(), this);

        this.d3Model.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnPointerOverTrigger
                },
                () => {
                    // if (this.elementModel.types.includes("CROWN")) {
                    //     this.focusScale(true); 
                    // }
                    this.highlight(true);
                    this.links.forEach(l => {
                        if (l.type === "BRIDGE") {
                            if (l.src == this) {
                                l.dest.highlight(true);
                                l.dest.links.forEach(link => link.display(undefined, true));
                            } else {
                                l.src.highlight(true);
                                l.src.links.forEach(link => link.display(undefined, true));

                            }
                        } else if (l.type === "CODE_CLONE") {
                            if (l.src == this) {
                                l.dest.highlight(true);
                            } else {
                                l.src.highlight(true);
                            }
                        }
                        l.display(undefined, true);

                    });
                    if (SelectedBuildingController.selected.length == 0) {
                        UIController.displayObjectInfo(this);
                    }
                }
            )
        );
        this.d3Model.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnPointerOutTrigger
                },
                () => {
                    // if (this.elementModel.types.includes("CROWN") && this.d3Model.scaling.y !== 1) {
                    //     this.focusScale(false);
                    // }
                    this.highlight(false);
                    this.links.forEach(l => {
                        if (l.type === "BRIDGE" || l.type === "CODE_CLONE") {
                            if (l.src == this) {
                                l.dest.highlight(false);
                                l.dest.links.forEach(link => link.display(undefined, false));
                            } else {
                                l.src.highlight(false);
                                l.src.links.forEach(link => link.display(undefined, false));
                            }
                        }
                        l.display(undefined, false);
                    });
                }
            )
        );
        this.d3Model.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnPickTrigger
                },
                () => {
                    this.flag = !this.flag;
                    this.selectAndDisplayDetails(this.flag, this.flag);
                }
            )
        );
    }

    render(config?: Config, scale: number = 1) {
        // Display building
        this.d3Model = this.renderBaseElement(scale)
        this.d3Model.setPositionWithLocalVector(this.center);

        this.highlightLayer = new HighlightLayer("hl", this.scene);

        this.renderOutlineElement(scale);

        if (this.elementModel.types.includes("VARIANT_FILE") && !this.elementModel.types.includes("CORE_FILE")) {
            this.mat = this.createVariantFileMaterial();
        }
        else if (this.elementModel.types.includes("FILE") || this.elementModel.types.includes("CLONED")) {
            this.mat = this.createDirectoryDefaultMaterial();
        } else {
            this.mat = this.createDefaultMaterial();
        }

        // New way to display a metric: city fade
        this.displayMetricByCityFade(this.mat);

        // New way to display a metric: building opacity
        this.displayMetricByOpacity(this.mat)

        // New way to display a metric: building cracks
        this.displayMetricByCrack(this.mat)

        this.d3Model.material = this.mat;

        let offSet = 0;

        // draw sphere for decorator
        if (this.elementModel.types.includes("DECORATOR")) {
            this.d3ModelSphere = MeshBuilder.CreateSphere("sphere", {
                diameter: (this.getWidth() - this.padding) * scale,
            }, this.scene);
            this.d3ModelSphere.setPositionWithLocalVector(
                this.center.add(
                    new Vector3(
                        0,
                        offSet + this.getHeight() / 2 + (this.getWidth() - this.padding) / 2,
                        0)));
            this.d3ModelSphere.material = this.mat;
            this.d3ModelSphere.material.backFaceCulling = false;
            offSet += this.getWidth() - this.padding;
            this.d3Model = Mesh.MergeMeshes([this.d3Model, this.d3ModelSphere], true);
        }

        // draw reversed pyramid for template
        if (this.elementModel.types.includes("TEMPLATE")) {
            this.d3ModelInvertedPyramid = MeshBuilder.CreateCylinder("reversedPyramid", {
                diameterTop: 0,
                tessellation: 4,
                diameterBottom: (this.getWidth() - this.padding) * scale,
                height: (this.getWidth() - this.padding)
            }, this.scene);
            this.d3ModelInvertedPyramid.setPositionWithLocalVector(
                this.center.add(
                    new Vector3(
                        0,
                        offSet + this.getHeight() / 2 + (this.getWidth() - this.padding) / 2,
                        0
                    )));
            this.d3ModelInvertedPyramid.rotate(new Vector3(1, 0, 0), Math.PI);
            this.d3ModelInvertedPyramid.rotate(new Vector3(0, 1, 0), Math.PI / 4);
            this.d3ModelInvertedPyramid.material = this.mat;
            this.d3ModelInvertedPyramid.material.backFaceCulling = false;
            offSet += this.getWidth() - this.padding;
            this.d3Model = Mesh.MergeMeshes([this.d3Model, this.d3ModelInvertedPyramid], true);
        }

        // draw 16 faced prism for strategy
        if (this.elementModel.types.includes("STRATEGY")) {
            this.d3ModelPrism = MeshBuilder.CreateCylinder("prism", {
                tessellation: 8,
                diameter: (this.getWidth() - this.padding) * scale,
                height: (this.getWidth() - this.padding)
            }, this.scene);
            this.d3ModelPrism.setPositionWithLocalVector(
                this.center.add(
                    new Vector3(
                        0,
                        offSet + this.getHeight() / 2 + (this.getWidth() - this.padding) / 2,
                        0
                    )));
            this.d3ModelPrism.material = this.mat;
            this.d3ModelPrism.material.backFaceCulling = false;
            offSet += this.getWidth() - this.padding;
            this.d3Model = Mesh.MergeMeshes([this.d3Model, this.d3ModelPrism], true);
        }

        // draw chimney for factories
        if (this.elementModel.types.includes("FACTORY")) {
            this.d3ModelChimney1 = MeshBuilder.CreateCylinder("chimney1", {
                diameter: (this.getWidth() - this.padding) / 6 * scale,
                height: (this.getWidth() - this.padding)
            }, this.scene);
            this.d3ModelChimney2 = MeshBuilder.CreateCylinder("chimney2", {
                diameter: (this.getWidth() - this.padding) / 6 * scale,
                height: (this.getWidth() - this.padding)
            }, this.scene);
            this.d3ModelChimney3 = MeshBuilder.CreateCylinder("chimney3", {
                diameter: (this.getWidth() - this.padding) / 6 * scale,
                height: (this.getWidth() - this.padding)
            }, this.scene);
            this.d3ModelChimney1.setPositionWithLocalVector(
                this.center.add(new Vector3(-((this.getWidth() - this.padding) / 2) * 10 / 12, offSet + this.getHeight() / 2 + (this.getWidth() - this.padding) / 2, 0)));
            this.d3ModelChimney2.setPositionWithLocalVector(
                this.center.add(new Vector3(0, offSet + this.getHeight() / 2 + scale * (this.getWidth() - this.padding) / 2, 0)));
            this.d3ModelChimney3.setPositionWithLocalVector(
                this.center.add(new Vector3(((this.getWidth() - this.padding) / 2) * 10 / 12, offSet + this.getHeight() / 2 + (this.getWidth() - this.padding) / 2, 0)));
            this.d3ModelChimney1.material = this.mat;
            this.d3ModelChimney2.material = this.mat;
            this.d3ModelChimney3.material = this.mat;
            this.d3ModelChimney1.material.backFaceCulling = false;
            this.d3ModelChimney2.material.backFaceCulling = false;
            this.d3ModelChimney3.material.backFaceCulling = false;
            offSet += this.getWidth() - this.padding;
            this.d3Model = Mesh.MergeMeshes([this.d3Model, this.d3ModelChimney1, this.d3ModelChimney2, this.d3ModelChimney3], true);
        }

        // draw top pyramid if API class
        if (this.elementModel.types.includes("API")) {
            this.edgesWidth = 1.0
            this.d3ModelPyramid = MeshBuilder.CreateCylinder("pyramid", {
                diameterTop: 0,
                tessellation: 4,
                diameterBottom: (this.getWidth() - this.padding) * scale,
                height: (this.getWidth() - this.padding)
            }, this.scene);
            this.d3ModelPyramid.setPositionWithLocalVector(
                this.center.add(
                    new Vector3(
                        0,
                        offSet + this.getHeight() / 2 + (this.getWidth() - this.padding) / 2 + this.edgesWidth / 240, // Last addition is here to see the pyramid bottom edge
                        0
                    )
                )
            );
            this.d3ModelPyramid.rotate(new Vector3(0, 1, 0), Math.PI / 4);
            this.d3ModelPyramid.material = this.mat;
            this.d3ModelPyramid.material.backFaceCulling = false;
            this.d3Model = Mesh.MergeMeshes([this.d3Model, this.d3ModelPyramid], true);
        }
        
        if (this.elementModel.types.includes("CLONED")) {
            // console.log("before merge")
            // console.log(this.top)
            this.d3ModelShade = MeshBuilder.CreateCylinder("shade",{

                // height: this.crownConstanteSize + this.elementModel.metrics.getMetricValue("nbClones"), // Here to change the default size of the mesh
                // height: this.getHeight() + (this.elementModel.metrics.getMetricValue("nbClones") / 2),
                height: this.elementModel.metrics.getMetricValue("nbClones") / 2,
                // height: (this.getWidth() - this.padding) + this.elementModel.metrics.getMetricValue("nbClones"),
                diameter: this.elementModel.getWidth(this.config.variables.width) * scale,
            },this.scene);
            this.d3ModelShade.setPositionWithLocalVector(
                this.center.add(
                    new Vector3(
                        0,
                        (this.getHeight() / 2 + this.elementModel.metrics.getMetricValue("nbClones") / 4) + 0.25, // it is Y vector of the top. 
                        // 1.25,
                        0
                    )
                )
            );
            this.top = this.top.add(new Vector3(0, (this.getHeight() / 2 + this.elementModel.metrics.getMetricValue("nbClones") / 4) + 0.25, 0 ));
            this.d3ModelShade.material = this.mat;
            this.d3ModelShade.material.alpha = 0.1
            this.d3ModelShade.material.backFaceCulling = false;
            this.d3Model = Mesh.MergeMeshes([this.d3Model, this.d3ModelShade], true);
            // console.log("after merge")
            // console.log(this.top)
        }

        // Default edge coloring
        // this.renderEdges();

        if (this.config.building.colors.edges) {
            const edgesColor = this.getColor(this.config.building.colors.edges, this.elementModel.types);
            if (edgesColor !== undefined) {
                this.d3Model.enableEdgesRendering();
                this.d3Model.edgesWidth = this.edgesWidth;
                const c = Color3.FromHexString(edgesColor);
                this.d3Model.edgesColor = new Color4(c.r, c.g, c.b, 1);
            }

            this.setupActionManager();
        }

        if (this.config.fnf_base.colors.edges) {
            const edgesColor = this.getColor(this.config.fnf_base.colors.edges, this.elementModel.types)
            if (edgesColor !== undefined) {
                this.d3Model.enableEdgesRendering();
                const c = Color3.FromHexString(edgesColor);
                this.d3Model.edgesColor = new Color4(c.r, c.g, c.b, 1);
            }

        }
    }

    /**
     * Converts an RGB color value to HSV. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
     * Assumes r, g, and b are contained in the set [0, 1] and
     * returns h, s, and v in the set [0, 1].
     *
     * @param   r       The red color value
     * @param   g       The green color value
     * @param   b       The blue color value
     * @return  The HSV representation
     */
    public rgb2Hsv(r: number, g: number, b: number): number[] {

        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, v = max;

        let d = max - min;
        s = max == 0 ? 0 : d / max;

        if (max == min) {
            h = 0; // achromatic
        } else {
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }

            h /= 6;
        }

        return [h, s, v];
    }

    /**
     * Converts an HSV color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
     * Assumes h, s, and v are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * @param   h       The hue
     * @param   s       The saturation
     * @param   v       The value
     * @return  Array           The RGB representation
     */
    public hsv2Rgb(h: number, s: number, v: number) {
        let r, g, b;

        let i = Math.floor(h * 6);
        let f = h * 6 - i;
        let p = v * (1 - s);
        let q = v * (1 - f * s);
        let t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0:
                r = v; g = t; b = p;
                break;
            case 1:
                r = q; g = v; b = p;
                break;
            case 2:
                r = p; g = v; b = t;
                break;
            case 3:
                r = p; g = q; b = v;
                break;
            case 4:
                r = t; g = p; b = v;
                break;
            case 5:
                r = v; g = p; b = q;
                break;
        }

        return [r, g, b];
    }

    private hue2rgb(p: number, q: number, t: number) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    }

    /**
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes h, s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 1].
     *
     * @param   h       The hue
     * @param   s       The saturation
     * @param   l       The lightness
     * @return  The RGB representation
     */
    public hsl2Rgb(h: number, s: number, l: number): number[] {
        let r, g, b;

        if (s == 0) {
            r = g = b = l; // achromatic
        } else {
            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;
            r = this.hue2rgb(p, q, h + 1 / 3);
            g = this.hue2rgb(p, q, h);
            b = this.hue2rgb(p, q, h - 1 / 3);
        }

        return [r, g, b];
    }

    public normalize(val, max_v, min_v, min, max): number {
        let n = ((val - min_v) / (max_v - min_v))
        n = Math.max(min, n)
        n = Math.min(max, n)

        let c = (n * (max - min)) + min
        c = Math.max(min, c)
        c = Math.min(max, c)
        return c;
    }
}
