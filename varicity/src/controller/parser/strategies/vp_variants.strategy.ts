import { EntitiesList } from "../../../model/entitiesList";
import { NodeElement, VariabilityMetricsName } from "../symfinder_elements/nodes/node.element";
import { ClassImplem } from "../../../model/entitiesImplems/classImplem.model";
import { LinkElement } from "../symfinder_elements/links/link.element";
import { LinkImplem } from "../../../model/entitiesImplems/linkImplem.model";
import { VPVariantsImplem } from "../../../model/entitiesImplems/vpVariantsImplem.model";
import { JsonInputInterface, LinkInterface, NodeInterface } from "../../../model/entities/jsonInput.interface";
import { Config } from "../../../model/entitiesImplems/config.model";
import { ParsingStrategy } from "./parsing.strategy.interface";
import { Orientation } from "../../../model/entitiesImplems/orientation.enum";
import { Color3 } from "@babylonjs/core";
import { Building } from "../../../model/entities/building.interface";
import { Metrics } from "../../../model/entitiesImplems/metrics.model";
import { Color } from "../../../model/entities/config.interface";

const createGenerator = require('golden-number');
const hexToHsl = require('hex-to-hsl');
const hsl = require("hsl-to-hex");

/**
 * Strategy used to parse both Symfinder Java and Symfinder JS results
 */
export class VPVariantsStrategy implements ParsingStrategy {
    private static readonly FILE_TYPES = ["FILE", "DIRECTORY"];
    private static readonly FILE_CLASS_LINK_TYPES = ["EXPORT"];
    private static readonly FILE_LINK_TYPES = ["CHILD", "CORE_CONTENT", "CODE_CLONE"]

    public parse(data: JsonInputInterface, config: Config, project: string): EntitiesList {
        console.log('Analyzing with VP and variants strategy: ', data);
        console.log('Config used: ', config);
        if (data) {
            let nodesList: NodeElement[] = [];
            let fileList: NodeElement[] = [];
            const apiList: NodeElement[] = [];

            data.nodes.forEach(n => {
                let node = this.nodeInterface2nodeElement(n);

                this.checkAndAddApiClass(node, config, apiList);

                if (node.types.find((t => VPVariantsStrategy.FILE_TYPES.find(f => t === f)))) /// This is a file or a folder
                    fileList.push(node);
                else
                    nodesList.push(node);
            });

            const linkElements = data.links
                .filter(l => !VPVariantsStrategy.FILE_LINK_TYPES.includes(l.type)) /// Remove all that is bind to a file or a folder
                .map(l => new LinkElement(l.source, l.target, l.type));
            const allLinks = data.alllinks
                .filter(l => !VPVariantsStrategy.FILE_LINK_TYPES.includes(l.type)) /// Remove all that is bind to a file or a folder
                .map(l => new LinkElement(l.source, l.target, l.type));
            const hierarchyLinks = allLinks.filter(l => config.hierarchy_links.includes(l.type));
            const fileLinks = data.links
                .filter(l => VPVariantsStrategy.FILE_LINK_TYPES.includes(l.type)) /// Remove all that is not bind to a file or a folder
                .map(l => new LinkElement(l.source, l.target, l.type, l.percentage));
            const fileClassLinks = data.alllinks.filter(l => VPVariantsStrategy.FILE_CLASS_LINK_TYPES.includes(l.type));
            const fileHierarchyLinks = fileLinks.filter(l => config.hierarchy_links.includes(l.type));
            const cloneLinks = fileLinks.filter(l => l.type === "CODE_CLONE");
            const variantFiles = fileList.filter(f => f.types.includes("VARIANT_FILE"));

            nodesList.forEach(n => {
                n.addMetric(VariabilityMetricsName.NB_VARIANTS, this.getLinkedNodesFromSource(n, nodesList, linkElements).length);
            });
            fileList.forEach(n => {
                n.addMetric(VariabilityMetricsName.NB_VARIANTS, this.getLinkedNodesFromSource(n, fileList, fileLinks).length);
            })
            let total_exported: number = 0
            fileList.forEach(file => {
                file.exportedClasses = fileClassLinks
                    .filter(link => link.source === file.name)
                    .map(link => this.findNodeByName(link.target, nodesList))
                total_exported += file.exportedClasses.length;
            });
            let variantFilesColors: Map<string, { color: string }> = new Map<string, { color: string }>();
            let seedColor = config.fnf_base.colors.base.filter(c => c.name === "VARIANT_FILE")[0].color;
            let seedRgb = this.hex2rgb(seedColor);
            let seedHue = this.rgb2Hsv(seedRgb[0], seedRgb[1], seedRgb[2])
            let s = seedHue[1];
            let v = seedHue[2];
            const generator = createGenerator(seedHue[0]);
            variantFiles.forEach(f => {
                let splitted = f.name.split("/")
                let name = splitted[splitted.length - 1]
                if (variantFilesColors.has(name)) {
                    f.variantFileColor = variantFilesColors.get(name).color;
                } else {
                    let fHue: number = generator();
                    let fRgb = this.hsv2Rgb(fHue, s, v);
                    f.variantFileColor = this.rgb2Hex(fRgb[0], fRgb[1], fRgb[2]);
                    variantFilesColors.set(name, { color: f.variantFileColor })
                }
            });
            let maxClone = 0;
            let cloneNodes: NodeElement[] = []
            cloneLinks.forEach(link => {
                let srcNode = this.findNodeByName(link.source, fileList);
                if (!cloneNodes.includes(srcNode)) {
                    cloneNodes.push(srcNode);
                    srcNode.addMetric(VariabilityMetricsName.NB_CLONES, this.checkAndGetMetric(1));
                } else {
                    srcNode.metrics.increaseMetricValue(VariabilityMetricsName.NB_CLONES, 1);
                }
                // if (srcNode.cloneCrown === undefined) {
                //     let nodeI = this.findNodeByName(link.source, data.nodes);
                //     srcNode.cloneCrown = this.createCrownNode(nodeI);
                // } else {
                //     srcNode.cloneCrown.metrics.increaseMetricValue(VariabilityMetricsName.NB_CLONES, 1);
                // }
                let targetNode = this.findNodeByName(link.target, fileList);
                if (!cloneNodes.includes(targetNode)) {
                    cloneNodes.push(targetNode);
                    targetNode.addMetric(VariabilityMetricsName.NB_CLONES, this.checkAndGetMetric(1));
                } else {
                    targetNode.metrics.increaseMetricValue(VariabilityMetricsName.NB_CLONES, 1);
                }
                // if (targetNode.cloneCrown === undefined) {
                //     let nodeI = this.findNodeByName(link.target, data.nodes);
                //     targetNode.cloneCrown = this.createCrownNode(nodeI);
                // } else {
                //     targetNode.cloneCrown.metrics.increaseMetricValue(VariabilityMetricsName.NB_CLONES, 1);
                // }
                let linkMax = Math.max(srcNode.metrics.getMetricValue(VariabilityMetricsName.NB_CLONES), targetNode.metrics.getMetricValue(VariabilityMetricsName.NB_CLONES));
                if (linkMax > maxClone) {
                    maxClone = linkMax
                }
            });
            console.log(cloneNodes.length)
            cloneNodes.forEach(node => {
                // node.cloneCrown.maxClone = maxClone;
                node.maxClone = maxClone
                node.types.push("CLONED")
            })

            this.buildComposition(hierarchyLinks, nodesList, apiList, 0, config.orientation); // Add composition level to classes
            this.buildComposition(fileHierarchyLinks, fileList, apiList, 0, config.orientation); // Add composition level to files ?

            const d = this.buildDistricts(nodesList, hierarchyLinks, config.orientation); // Create a district for classes
            const fileDistrict = this.buildDistricts(fileList, fileHierarchyLinks, config.orientation); // Create a district for file

            let result = new EntitiesList();
            result.district = d;
            result.file_district = fileDistrict;

            if (config.api_classes !== undefined) {
                data.allnodes.filter(
                    nod => config.api_classes.includes(nod.name)
                        && !nodesList.map(no => no.name).includes(nod.name)
                ).forEach(n => {
                    let node = this.nodeInterface2nodeElement(n, false);

                    node.types.push("API");

                    let c = new ClassImplem(
                        node,
                        node.compositionLevel
                    );

                    result.district.addBuilding(c);
                });
            }

            this.addAllLink(allLinks, result);
            this.addAllLink(fileLinks, result);

            // log for non-vp non-variant nodes
            // console.log(data.allnodes.filter(nod => !nodesList.map(no => no.name).includes(nod.name)).map(n => n.name));

            // log the results
            console.log("Result of parsing: ", result);

            return result;
        }
        throw new Error('Data is undefined');
    }

    private createCrownNode(nodeI: NodeInterface): NodeElement {
        let node = this.nodeInterface2nodeElement(nodeI, false);
        node.types.push("CROWN");
        node.addMetric(VariabilityMetricsName.NB_CLONES, this.checkAndGetMetric(1));
        return node;
    }

    private addAllLink(links: LinkElement[], result: EntitiesList) {
        links.forEach(link => {
            const source = result.getBuildingFromName(link.source);
            const target = result.getBuildingFromName(link.target);
            if (source !== undefined && target !== undefined) {
                result.links.push(new LinkImplem(source, target, link.type, link.percentage));
                // link.type === "CODE_CLONES" ? this.setClones(source, target, true) : this.setClones(source, target, false);
            }
        })
    }

    // private setClones(src: Building, target: Building, isCloned: boolean) {
    //     src.setCloned(isCloned);
    //     target.setCloned(isCloned);
    // }

    /**
     * Check if the given value is not undefined and returns it. If the value is undefined, then return a default value
     */
    private checkAndGetMetric(value: number, _default: number = 0) {
        return (value === undefined) ? _default : value
    }

    /**
     * Check if a node is an api class. If yes, then add the API tag to the node and put it in the given list
     */
    private checkAndAddApiClass(node: NodeElement, config: Config, apiList: NodeElement[]) {
        if (config.api_classes === undefined)
            return;
        else if (config.api_classes.includes(node.name)) {
            // console.log("API class: ", node.name);
            node.types.push("API");
            apiList.push(node);
        }
    }

    /**
     * Create a new node element from a node interface
     *
     * <br><i>This should help reduce the complexity of the {@link #parse} method</i><br>
     *
     * @param n The node interface that should be use as template
     * @param type_copy should the type be copied from n or point to the same array as n types
     * @private
     */
    private nodeInterface2nodeElement(n: NodeInterface, type_copy: boolean = true) {
        let node: NodeElement = new NodeElement(n.name);

        node.addMetric(VariabilityMetricsName.NB_METHOD_VARIANTS, this.checkAndGetMetric(n.methodVariants));

        const attr = n.attributes;
        let nbAttributes = 0;
        attr?.forEach(a => {
            nbAttributes += a.number
        });

        node.addMetric(VariabilityMetricsName.NB_ATTRIBUTES, nbAttributes);
        node.addMetric(VariabilityMetricsName.NB_CONSTRUCTOR_VARIANTS, this.checkAndGetMetric(n.constructorVariants));

        node.types = type_copy ? Object.assign([], n.types) : n.types;

        // Check that this one is not too much
        node.fillMetricsFromNodeInterface(n);

        return node;
    }

    /**
     * This method is here to help reduce complexity of {@link #buildComposition} method below
     * @param node The node to add
     * @param target The node name that should exist in the list
     * @param message The message to add as node origin
     * @param srcNodes The sources where to add the new node
     * @param p The predicate that should be verified if the node is undefined or the target is not in the source list
     */
    private addNewNodeIfNotExist(
        node: NodeElement,
        target: string,
        message: string,
        srcNodes: NodeElement[],
        p: (n: NodeElement) => boolean = (n) => n.compositionLevel === -1
    ) {
        if (node !== undefined || p(node) || !srcNodes.map(e => e.name).includes(target)) {
            node.origin = message;
            srcNodes.push(node)
        }
    }

    private isLinkParsable(l: LinkInterface, n: NodeElement, nodeNames: string[]) {
        return (l.target === n.name && !nodeNames.includes(l.source)) // IN
            || (l.source === n.name && !nodeNames.includes(l.target)) // OUT
            || l.type !== "EXPORT" // Link between classes and files
    }

    private buildComposition(
        alllinks: LinkInterface[],
        nodes: NodeElement[],
        srcNodes: NodeElement[],
        level: number,
        orientation: Orientation
    ): void {
        const newSrcNodes: NodeElement[] = [];
        const nodeNames = srcNodes.map(sn => sn.name);
        nodes.forEach(n => {
            if (nodeNames.includes(n.name)) {
                n.compositionLevel = level;
                alllinks.filter(l => {
                    return this.isLinkParsable(l, n, nodeNames);
                }).forEach(l => {
                    /// According to the orientation asked by the user, put the target (OUT) or the source (IN) first
                    if ((orientation === Orientation.OUT || orientation === Orientation.IN_OUT) && n.name === l.source && n.name !== l.target) { // OUT
                        this.addNewNodeIfNotExist(
                            this.findNodeByName(l.target, nodes),
                            l.target,
                            n.name + " (source)",
                            newSrcNodes
                        );
                    } else if ((orientation === Orientation.IN || orientation === Orientation.IN_OUT) && n.name === l.target && n.name !== l.source) { // IN
                        this.addNewNodeIfNotExist(
                            this.findNodeByName(l.source, nodes),
                            l.source,
                            n.name + " (target)",
                            newSrcNodes
                        );
                    }
                });
            }
        });
        if (newSrcNodes.length > 0) {
            this.buildComposition(alllinks, nodes, newSrcNodes, level + 1, orientation);
        }
    }

    /**
     * Build each district from the roots that are the compositionLevel zero
     */
    private buildDistricts(nodes: NodeElement[], links: LinkElement[], orientation: Orientation): VPVariantsImplem {
        const roots = nodes.filter(n => n.compositionLevel === 0);
        const rootElems = roots.map(r => {
            return this.buildDistrict(r, nodes, links, 0, orientation);
        });
        let res = new VPVariantsImplem();
        rootElems.forEach(e => {
            if (e instanceof VPVariantsImplem) {
                res.districts.push(e);
            } else {
                res.buildings.push(e);
            }
        });
        return res;
    }

    private buildDistrict(nodeElement: NodeElement, nodes: NodeElement[], links: LinkElement[], level: number, orientation: Orientation): VPVariantsImplem | ClassImplem {
        const outLinks = this.getLinkedNodesFromSource(nodeElement, nodes, links); // OUT
        const inLinks = this.getLinkedNodesToTarget(nodeElement, nodes, links); // IN
        const linked: NodeElement[] = [];
        if (orientation === Orientation.OUT || orientation === Orientation.IN_OUT) {
            linked.push(...outLinks);
        }
        if (orientation === Orientation.IN || orientation === Orientation.IN_OUT) {
            linked.push(...inLinks);
        }

        const children = linked.filter(ln => ln.compositionLevel === level + 1);
        if (children.length > 0) {
            let result = new VPVariantsImplem(new ClassImplem(
                nodeElement,
                nodeElement.compositionLevel,
                // nodeElement.forceColor
            ));

            result.vp.exportedClasses = nodeElement.exportedClasses.map(nodeElement => new ClassImplem(nodeElement, 0));
            if (nodeElement.cloneCrown) {
                result.vp.cloneCrown = new ClassImplem(nodeElement.cloneCrown, 0);
            }

            children.forEach(c => {
                const r = this.buildDistrict(c, nodes, links, level + 1, orientation);
                if (r instanceof VPVariantsImplem) {
                    result.districts.push(r);
                } else {
                    result.buildings.push(r);
                }
            });
            return result;
        } else {
            let result = new ClassImplem(
                nodeElement,
                nodeElement.compositionLevel,
                // nodeElement.forceColor
            );

            result.exportedClasses = nodeElement.exportedClasses.map(nodeElement => new ClassImplem(nodeElement, 0));
            if (nodeElement.cloneCrown) {
                result.cloneCrown = new ClassImplem(nodeElement.cloneCrown, 0);
            }
            return result;
        }
    }

    private getLinkedNodesFromSource(n: NodeElement, nodes: NodeElement[], links: LinkElement[]): NodeElement[] {
        const name = n.name;
        const res: NodeElement[] = [];

        links.forEach(l => {
            if (l.source === name && l.target !== name) {
                const n = this.findNodeByName(l.target, nodes);
                if (n !== undefined)
                    res.push(n);
            }
        });

        return res;
    }

    private getLinkedNodesToTarget(n: NodeElement, nodes: NodeElement[], links: LinkElement[]): NodeElement[] {
        const name = n.name;
        const res: NodeElement[] = [];

        links.forEach(l => {
            if (l.source !== name && l.target === name) {
                const n = this.findNodeByName(l.source, nodes);
                if (n !== undefined)
                    res.push(n);
            }
        });

        return res;
    }

    private findNodeByName(name: string, nodes: NodeInterface[]): NodeInterface;
    private findNodeByName(name: string, nodes: NodeElement[]): NodeElement;
    private findNodeByName(name: string, nodes: NodeInterface[] | NodeElement[]): NodeInterface | NodeElement {
        for (const element of nodes) {
            if (element.name === name) {
                return element;
            }
        }
        return undefined;
    }

    private findDuplicatedFiles(files: NodeElement[], links: LinkElement[]): NodeElement[][] {
        const excluded = []
        const res: NodeElement[][] = []

        for (const file of files) {
            if (excluded.includes(file))
                continue;
            res.push(this.findDuplicatesForFile(file, files, links, excluded));
        }

        return res;
    }

    private findDuplicatesForFile(
        file: NodeElement,
        files: NodeElement[],
        links: LinkElement[],
        excluded: NodeElement[]
    ): NodeElement[] {
        if (excluded.includes(file))
            return []
        excluded.push(file)

        const res = [file]
        const duplicates = this.getLinkedNodesFromSource(file, files, links);
        for (const duplicate of duplicates) {
            res.push(...this.findDuplicatesForFile(duplicate, files, links, excluded));
        }

        return res
    }

    private areColorClose(color1: Color3, color2: Color3, epsilon: number = 0.01) {
        return Math.abs(color1.r - color2.r) < epsilon && Math.abs(color1.g - color2.g) < epsilon && Math.abs(color1.b - color2.b) < epsilon
    }

    private pickColorsForNElements(n: number, max_try: number = 10): Color3[] {
        const colors = [];

        for (let i = 0; i < n; i++) {
            let color;
            let nb_try = 0;
            do {
                color = Color3.Random();
                nb_try++
            } while (colors.some(c => this.areColorClose(color, c)) && nb_try < max_try);
            colors.push(color);
        }

        return colors;
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
    private rgb2Hsv(r: number, g: number, b: number): number[] {

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
    private hsv2Rgb(h: number, s: number, v: number) {
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

    private hex2rgb(h: string): number[] {
        let r = parseInt(h.slice(1, 3), 16);
        let g = parseInt(h.slice(3, 5), 16);
        let b = parseInt(h.slice(5, 7), 16);

        return [r, g, b]
    }

    private rgb2Hex(r: number, g: number, b: number): string {
        const componentToHex = (c: number) => {
            const hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }
        return "#" + componentToHex(Math.ceil(r)) + componentToHex(Math.ceil(g)) + componentToHex(Math.ceil(b));
    }
}
