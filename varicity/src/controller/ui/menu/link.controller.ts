import {UIController} from "../ui.controller";
import {SubMenuController} from "./sub-menu.controller";
import {CriticalLevel} from "../../../model/entitiesImplems/config.model";
import {SubMenuInterface} from "./sub-menu.interface";

export class LinkController implements SubMenuInterface {

    public defineSubMenuTitle(): string {
        return "Links"
    }

    public createMenu(parent: HTMLElement) {

        const menuColor = SubMenuController.createMenu("Colors", true, parent);
        const displayMenu = SubMenuController.createMenu("Display", true, parent);
        const hierarchyMenu = SubMenuController.createMenu("Hierarchy links", true, parent);

        if (UIController.config) {

            // fetch the links
            const links = UIController.config.link;

            // colors
            links.colors.forEach(color => {
                let colorPicker = SubMenuController.createColorSelector(color.name, color.color, menuColor);

                colorPicker.addEventListener("change", (ke) => {
                    color.color = colorPicker.value
                    UIController.updateScene(CriticalLevel.LOW_IMPACT); // Reload the screen
                });
            })

            // Air traffic and Underground Road
            const airTraffic = links.display.air_traffic;
            const undergroundRoads = links.display.underground_road;
            SubMenuController.createDoubleText("Air Traffic", "Underground Road", displayMenu);

            LinkController.radioBoxListener(SubMenuController.createCustomRadioBox("IMPLEMENTS", airTraffic.includes('IMPLEMENTS'), undergroundRoads.includes('IMPLEMENTS'), displayMenu), 'IMPLEMENTS');
            LinkController.radioBoxListener(SubMenuController.createCustomRadioBox("EXTENDS", airTraffic.includes('EXTENDS'), undergroundRoads.includes('EXTENDS'), displayMenu), 'EXTENDS');
            LinkController.radioBoxListener(SubMenuController.createCustomRadioBox("CODE_CLONE", airTraffic.includes('CODE_CLONE'), undergroundRoads.includes('CODE_CLONE'), displayMenu), 'CODE_CLONE');
            LinkController.radioBoxListener(SubMenuController.createCustomRadioBox("BRIDGE", airTraffic.includes('BRIDGE'), undergroundRoads.includes('BRIDGE'), displayMenu), 'BRIDGE');

            // Hierarchy Links
            const hierarchyLinks = UIController.config.hierarchy_links;

            LinkController.checkBoxListener(SubMenuController.createCheckBox("IMPLEMENTS", hierarchyLinks.includes('IMPLEMENTS'), hierarchyMenu), 'IMPLEMENTS');
            LinkController.checkBoxListener(SubMenuController.createCheckBox("EXTENDS", hierarchyLinks.includes('EXTENDS'), hierarchyMenu), 'EXTENDS');
            LinkController.checkBoxListener(SubMenuController.createCheckBox("USAGE", hierarchyLinks.includes('USAGE'), hierarchyMenu), 'USAGE');
            LinkController.checkBoxListener(SubMenuController.createCheckBox("CHILD", hierarchyLinks.includes('CHILD'), hierarchyMenu), 'CHILD');
        }

    }

    private static checkBoxListener(htmlInputElements: HTMLInputElement, parameter: string) {

        const hierarchyLinks = UIController.config.hierarchy_links;

        htmlInputElements.addEventListener('change', function () {
            if (htmlInputElements.checked) {
                hierarchyLinks.push(parameter)
            } else {
                hierarchyLinks.splice(hierarchyLinks.indexOf(parameter), 1)
            }
            UIController.updateScene(CriticalLevel.REPARSE_DATA); // Reload the screen
        });
    }

    private static radioBoxListener(htmlInputElements: HTMLInputElement[], parameter: string) {

        let underground_road = UIController.config.link.display.underground_road;
        let air_traffic = UIController.config.link.display.air_traffic;

        htmlInputElements[0].addEventListener('change', function () {
            if (htmlInputElements[0].checked) {
                air_traffic.push(parameter)
                if (htmlInputElements[1].checked) {
                    htmlInputElements[1].checked = false;
                    underground_road.splice(underground_road.indexOf(parameter), 1)
                }
            } else {
                air_traffic.splice(air_traffic.indexOf(parameter), 1)
            }
            UIController.updateScene(CriticalLevel.LOW_IMPACT); // Reload the screen
        });

        htmlInputElements[1].addEventListener('change', function () {
            if (htmlInputElements[1].checked) {
                underground_road.push(parameter)
                if (htmlInputElements[0].checked) {
                    htmlInputElements[0].checked = false;
                    air_traffic.splice(air_traffic.indexOf(parameter), 1)
                }
            } else {
                underground_road.splice(underground_road.indexOf(parameter), 1)
            }
            UIController.updateScene(CriticalLevel.LOW_IMPACT); // Reload the screen
        });
    }

}
