import {LinkController} from "./link.controller";
import {SubMenuController} from "./sub-menu.controller";
import bootstrap from "../../../../public/scripts/bootstrap.bundle.min.js"
import {SubMenuInterface} from "./sub-menu.interface";
import {MetricController} from "./metric.controller";
import {DetailsController} from "./details.controller";
import {BuildingController} from "./building.controller";
import { FoldersAndFilesController } from "./folders-and-files.controller";
import {DistrictController} from "./district.controller";
import {ApiAndBlacklistController} from "./api-and-blacklist.controller";
import {ProjectConfigMenuController} from "./project-config-menu.controller";
import {SaveMenuController} from "./save-menu.controller";
import {DocController} from "./doc.controller";
import {SettingsController} from "./settings.controller";

export class MenuController {

    public static selectedTab;

    private static menuElements = new Map<string, SubMenuInterface>();

    private static MAIN_MENU = "main-menu";
    private static TOOL_MENU = "tool-menu";

    public static createMenu() {
        this.addMenuElements();
        this.addListeners(MenuController.MAIN_MENU);
        this.addListeners(MenuController.TOOL_MENU);
        this.addTooltipListeners();
    }

    private static addMenuElements() {
        MenuController.createMenuElement("Projects and Configurations", "project-config.svg", new ProjectConfigMenuController(), false, true, true, true);

        MenuController.createMenuElement("Information", "information.svg", new DetailsController(), false, false, true);
        MenuController.createMenuElement("Building", "building.svg", new BuildingController());
        MenuController.createMenuElement("Folders and Files", "fnf.svg", new FoldersAndFilesController()); 
        MenuController.createMenuElement("District", "district.svg", new DistrictController());
        MenuController.createMenuElement("Link", "links.svg", new LinkController());
        MenuController.createMenuElement("APIs and Blacklist", "api_2.svg", new ApiAndBlacklistController());
        MenuController.createMenuElement("Metrics", "metric-entrypoints.svg", new MetricController(), false, false, true);
        MenuController.createMenuElement("Save", "save.svg", new SaveMenuController(), true, true, false, true);
        MenuController.createMenuElement("Documentation", "documentation.svg", new DocController(), true, true);
        MenuController.createMenuElement("Settings", "settings.svg", new SettingsController(), true);
    }

    public static addListeners(listId: string) {

        // @ts-ignore
        for (let child of document.getElementById(listId).children) {
            child.onclick = (me) => {

                if (child.className === "collapsible-button") { // If open the collapsible submenu

                    var img = this.changeImage(child);

                    if (this.selectedTab && this.selectedTab !== child) {
                        img = this.changeImage(this.selectedTab);
                        this.selectedTab.getElementsByTagName('img').item(0).setAttribute("src", img.getAttribute("src").replace("_selected.svg", ".svg"));
                    }
                    if (this.selectedTab == child) {
                        this.selectedTab = undefined;
                    } else {
                        this.selectedTab = child;
                    }
                    this.createSubMenu(this.selectedTab)
                } else { // If open a dialog box
                    this.displayEmbeddedMenu(child)
                }
            }
        }
    }

    public static closeMenu(){
        if(MenuController.selectedTab){
            document.getElementById("submenu").style.display = "none";
            this.changeImage(this.selectedTab);
            MenuController.selectedTab = undefined;
        }
    }

    private static createSubMenu(selectedTab: Element) {
        // clear the sub-menu
        const subMenuParent = SubMenuController.getParentContentSubMenu();
        subMenuParent.innerHTML = "";

        if (selectedTab) {
            MenuController.populateMenuElement(selectedTab.getAttribute("id"));

            // Display the sub menu
            document.getElementById("submenu").style.display = "block";

        } else { // All tabs are closed
            // Hide the sub menu
            document.getElementById("submenu").style.display = "none";
        }
    }

    private static displayEmbeddedMenu(selectedTab: Element) {
        MenuController.populateEmbeddedMenuElement(selectedTab.getAttribute("id"));
    }

    public static changeImage(element: Element) {
        const img = element.getElementsByTagName('img').item(0);
        if (!img.getAttribute("src").match("_selected.svg$")) {
            img.setAttribute("src", img.getAttribute("src").replace(".svg", "_selected.svg"));
        } else {
            img.setAttribute("src", img.getAttribute("src").replace("_selected.svg", ".svg"));
        }
        return img;
    }

    private static addTooltipListeners() {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.forEach(function (tooltipTriggerEl) {
            new bootstrap.Tooltip(tooltipTriggerEl, {trigger: 'hover'});
        })
    }

    private static createMenuElement(menuName: string, iconNameWithExtension: string, menuController: SubMenuInterface, isAtTheBottom?: boolean, isNotACollapsible?: boolean, hasBottomSeparator?: boolean, hasTopSeparator?: boolean): HTMLElement {

        // create menu icon button
        const listElement = document.createElement("li");
        listElement.id = menuName;

        const linkElement = document.createElement("a");
        linkElement.classList.add("nav-link", "py-3");
        linkElement.href = "#";
        linkElement.setAttribute("aria-current", "page");
        linkElement.title = menuName;
        linkElement.setAttribute("data-bs-toggle", "tooltip");
        linkElement.setAttribute("data-bs-placement", "left");

        const imageElement = document.createElement("img");
        imageElement.classList.add("bi");
        imageElement.width = 24;
        imageElement.height = 24;
        imageElement.setAttribute("role", "img");
        imageElement.setAttribute("aria-label", menuName);
        imageElement.src = "images/menu-icons/section-icons/" + iconNameWithExtension;

        // logic
        if (hasBottomSeparator) {
            linkElement.classList.add("border-bottom");
        }
        if (hasTopSeparator) {
            linkElement.classList.add("border-top");
        }

        if (!isNotACollapsible) {
            SubMenuController.changeTitleSubMenuElement(menuController.defineSubMenuTitle());
            listElement.classList.add("collapsible-button");
        }

        let parent: HTMLElement;
        this.menuElements.set(menuName, menuController);
        if (isAtTheBottom) {
            parent = document.getElementById(MenuController.TOOL_MENU);
        } else {
            parent = document.getElementById(MenuController.MAIN_MENU);
        }

        // create element structure and add to
        parent.appendChild(listElement);
        listElement.appendChild(linkElement);
        linkElement.appendChild(imageElement);

        return listElement;
    }

    private static populateMenuElement(menuId: string) {
        const subMenuParent = SubMenuController.getParentContentSubMenu();
        const menuElement = this.menuElements.get(menuId);
        menuElement.createMenu(subMenuParent);
        SubMenuController.changeTitleSubMenuElement(menuElement.defineSubMenuTitle());
    }

    private static populateEmbeddedMenuElement(menuId: string) {
        const menuElement = this.menuElements.get(menuId);
        menuElement.createMenu(undefined);
    }
}
