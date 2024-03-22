import {Building3D} from '../../../view/common/3Delements/building3D';
import {SubMenuController} from "./sub-menu.controller";
import {Metrics} from "../../../model/entitiesImplems/metrics.model";
import {MenuController} from "./menu.controller";
import {SubMenuInterface} from "./sub-menu.interface";

export class DetailsController implements SubMenuInterface {

    private static force: boolean = false;
    private static current: Building3D;

    defineSubMenuTitle(): string {
        return "Information";
    }

    public createMenu(parent: HTMLElement) {
        DetailsController.displayObjectInfo(DetailsController.current, false)
    }

    public static displayObjectInfo(obj: Building3D, force: boolean) {

        if (!MenuController.selectedTab || MenuController.selectedTab === DetailsController.getInformationTab()) {
            if (obj) {
                // clear the sub-menu
                SubMenuController.getParentContentSubMenu().innerHTML = "";

                if (this.force && !force) return;
                if (this.force && force) {
                    this.current.highlight(false, true);
                    this.current.showAllLinks(false);
                }
                this.current = obj
            }

            const subMenuParent = SubMenuController.getParentContentSubMenu();

            const modelSubMenu = SubMenuController.createMenu("Model", true, subMenuParent);
            const metricSubMenu = SubMenuController.createMenu("Metrics", true, subMenuParent);
            const linksSubMenu = SubMenuController.createMenu("Links", true, subMenuParent);

            if (DetailsController.current) {
                this.populateModel(DetailsController.current.elementModel, modelSubMenu);
                this.populateMetric(DetailsController.current.elementModel.metrics, metricSubMenu);
                this.populateLinks(DetailsController.current, linksSubMenu);
            }
        }
    }

    private static populateModel(building: any, parent: HTMLElement) {
        SubMenuController.createShortReadonlyText("Origin", building.origin, parent)
        SubMenuController.createShortReadonlyText("Name", building.name, parent)
        // console.log("Types of " + building.name + ": " + building.types)
        SubMenuController.createIconDisplaySVG("Types", this.getIconPaths(building.types), parent);

        SubMenuController.createShortReadonlyText("Comp. level", building.compLevel.toString(), parent)
        SubMenuController.createShortReadonlyText("Analyzer", building.analyzed, parent)
        SubMenuController.createShortReadonlyText("Root", building.root, parent)
    }

    private static populateMetric(metric: Metrics, parent: HTMLElement) {
        metric.metrics.forEach((value, key) => {
            if (value.value) /// Avoid trouble when value.value is null
                SubMenuController.createLongReadonlyText(key, value.value.toString(), parent)
        })
    }

    private static populateLinks(obj: Building3D, parent: HTMLElement) { // to check

        for (let l of obj.links) {

            let keyElement = document.getElementById(l.type);
            if (keyElement == undefined) { // we check if we have already declared him
                keyElement = SubMenuController.createSimpleText(l.type + ':', parent);
                keyElement.setAttribute("id", l.type);
            }

            let target = (l.src.getName() == obj.getName() ? l.dest : l.src);
            let element = SubMenuController.createOnlyInputReadonlyText(target.getName(), keyElement);

            element.addEventListener("mouseenter", () => {
                target.highlight(true);
            });

            element.addEventListener("mouseleave", () => {
                target.highlight(false);
            });

            element.addEventListener("click", () => {
                target.focus();
            });
        }
    }

    private static getIconPaths(types: string[]) {
        let paths = [];

        if (types) {
            types.forEach(type => {
                switch (type) {
                    case "API":
                        paths.push("./images/menu-icons/class-types/api/" + type + ".svg");
                        break;
                    case "COMPOSITION_STRATEGY":
                    case "DECORATOR":
                    case "FACTORY":
                    case "STRATEGY":
                    case "TEMPLATE":
                        paths.push("./images/menu-icons/class-types/design-patten/" + type + ".svg");
                        break;
                    case "ABSTRACT":
                    case "DENSE":
                    case "HOTSPOT":
                    case "INNER":
                    case "METHOD_LEVEL_VP":
                    case "OUT_OF_SCOPE":
                    case "VARIANT":
                    case "VP":
                    case "VP_FOLDER":
                    case "VARIANT_FOLDER":
                    case "VARIANT_FILE":
                        paths.push("./images/menu-icons/class-types/entity-attribute/" + type + ".svg");
                        break;
                    case "CLASS":
                    case "CONSTRUCTOR":
                    case "INTERFACE":
                    case "METHOD":
                    case "FILE":
                    case "DIRECTORY":
                        paths.push("./images/menu-icons/class-types/entity-type/" + type + ".svg");
                        break;
                    case "PRIVATE":
                    case "PUBLIC":
                        paths.push("./images/menu-icons/class-types/entity-visibility/" + type + ".svg");
                        break;
                    case "EXTENDS":
                    case "IMPLEMENTS":
                    // case "INNER":
                    // case "METHOD":
                    case "USAGE":
                    case "CHILD":
                    case "CODE_CLONE":
                    case "CORE_CONTENT":
                        paths.push("./images/menu-icons/class-types/relation-type/" + type + ".svg");
                        break;
                }
            });
        }
        return paths;
    }

    public static getInformationTab(): HTMLElement {
        return document.getElementById("Information")
    }
}
