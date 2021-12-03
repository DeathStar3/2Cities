import {Building3D} from '../../../view/common/3Delements/building3D';
import {SubMenuController} from "./sub-menu.controller";
import {Building} from "../../../model/entities/building.interface";
import {Metrics} from "../../../model/entitiesImplems/metrics.model";

export class DetailsController {

    private static force: boolean = false;
    private static current: Building3D;

    static createMenu() {
        this.displayObjectInfo(this.current, false)
    }

    static displayObjectInfo(obj: Building3D, force: boolean) {

        if (obj){
            // clear the sub-menu
            (document.getElementById("submenu-content") as HTMLElement).innerHTML = "";

            if(this.force && !force) return;
            if(this.force && force) {
                this.current.highlight(false, true);
                this.current.showAllLinks(false);
            }
            this.current = obj
        }

        const parent = document.getElementById("submenu-content") as HTMLElement;

        // Set title
        const title = document.getElementById("submenu-title") as HTMLElement;
        title.innerHTML = "Information";
        const modelSubMenu = SubMenuController.createMenu("Model", true, parent);
        const metricSubMenu = SubMenuController.createMenu("Metrics", true, parent);
        const linksSubMenu = SubMenuController.createMenu("Links", true, parent);

        if (obj){
            this.populateModel(obj.elementModel, modelSubMenu);
            this.populateMetric(obj.elementModel.metrics, metricSubMenu);
            this.populateLinks(obj, linksSubMenu);
        }

    }

    private static populateModel(building: any, parent: HTMLElement) {
        SubMenuController.createShortReadonlyText("Origin", building.origin, parent)
        SubMenuController.createShortReadonlyText("Name", building.name, parent)

        // TODO Missing Type icons here !

        SubMenuController.createShortReadonlyText("Comp. level", building.compLevel.toString(), parent)
        SubMenuController.createShortReadonlyText("Analyzer", building.analyzed, parent)
        SubMenuController.createShortReadonlyText("Root", building.root, parent)
    }

    private static populateMetric(metric: Metrics, parent: HTMLElement) {
        metric.metrics.forEach((value, key) => {
            SubMenuController.createLongReadonlyText(key, value.value.toString(), parent)
        })
    }

    private static populateLinks(obj: Building3D, parent: HTMLElement) {

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
}
