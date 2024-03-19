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
            const fileHierarchyLinks = fileLinks.filter(l => config.hierarchy_links.includes(l.type))
             

            nodesList.forEach(n => {
                n.addMetric(VariabilityMetricsName.NB_VARIANTS, this.getLinkedNodesFromSource(n, nodesList, linkElements).length);
            });
            fileList.forEach(n => {
                n.addMetric(VariabilityMetricsName.NB_VARIANTS, this.getLinkedNodesFromSource(n, fileList, fileLinks).length);
            })
            fileList.forEach(file => {
                file.exportedClasses = fileClassLinks
                    .filter(link => link.source === file.name)
                    .map(link => this.findNodeByName(link.target, nodesList))
            });

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

    private addAllLink(links: LinkElement[], result: EntitiesList) {
        links.forEach(link => {
            const source = result.getBuildingFromName(link.source);
            const target = result.getBuildingFromName(link.target);
            if (source !== undefined && target !== undefined) {
                result.links.push(new LinkImplem(source, target, link.type, link.percentage));
            }
        })
    }

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

    private findNodeByName(name: string, nodes: NodeElement[]): NodeElement {
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
}
