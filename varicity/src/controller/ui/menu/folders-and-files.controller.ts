import {Color} from "../../../model/entities/config.interface";
import {CriticalLevel} from "../../../model/entitiesImplems/config.model";
import Sortable from 'sortablejs';
import {SubMenuController} from "./sub-menu.controller";
import {SubMenuInterface} from "./sub-menu.interface";
import {UIController} from "../ui.controller";

 


export class FoldersAndFilesController implements SubMenuInterface {

    defineSubMenuTitle(): string {
        return "Folders and Files";
    }

    public createMenu(parent: HTMLElement) {
        const menuPadding = SubMenuController.createMenu("Padding", true, parent);
        const menuBaseColors = SubMenuController.createMenu("Folder and File Base Color", true, parent);
        const menuEdgesColors = SubMenuController.createMenu("Crown Edges Color", true, parent);

        if (UIController.config) {

            let padding = UIController.config.fnf_base.padding;
            let colorsBase = UIController.config.fnf_base.colors.base;
            let colorEdges = UIController.config.fnf_base.colors.edges;

            let paddingSelector = SubMenuController.createRange("Padding", padding, 0.2, 2, 0.1, menuPadding);

            paddingSelector.addEventListener("change", () => {
                UIController.config.building.padding = +paddingSelector.value;
                console.log(UIController.config.building.padding)
                UIController.updateScene(CriticalLevel.RERENDER_SCENE);
            });

            this.createColorPickerDragAndDrop(colorsBase, menuBaseColors, UIController.config.fnf_base.colors.base);
            this.createColorPickerDragAndDrop(colorEdges, menuEdgesColors, UIController.config.fnf_base.colors.edges);
        }
    }

    private createColorPickerDragAndDrop(colorsBase: Color[], menuBaseColors: HTMLElement, colorList: Color[]) {
        let wrapperFaces = this.createDragAndDrop(colorsBase, menuBaseColors);

        new Sortable(wrapperFaces, {
            animation: 350,

            // Element dragging ended
            onEnd: function (evt) {
                const oldIndex = evt.oldIndex;  // target list
                const newIndex = evt.newIndex;  // previous list
                if (oldIndex !== newIndex) {
                    let newColor = colorList[oldIndex]

                    let indexTo = newIndex < oldIndex ? newIndex : newIndex + 1
                    colorList.splice(indexTo, 0, newColor);

                    let indexToDelete = indexTo > oldIndex ? oldIndex : oldIndex + 1
                    colorList.splice(indexToDelete, 1)
                    console.log(colorList)
                    UIController.updateScene(CriticalLevel.RERENDER_SCENE);
                }
            },
        });
    }

    private createDragAndDrop(colorsBase: Color[], menuBaseColors: HTMLElement) {
        let wrapperFaces = document.createElement("div");
        wrapperFaces.classList.add("wrapper");
        wrapperFaces.id = "wrapper-faces";

        if (colorsBase) {
            colorsBase.forEach(color => {
                let item = document.createElement("div");
                item.classList.add("item");

                if (!color.color) {
                    color.color = "#555555"
                }
                let colorPicker = SubMenuController.createColorSelector(color.name, color.color, item);

                colorPicker.addEventListener("change", (ke) => {
                    color.color = colorPicker.value
                    UIController.updateScene(CriticalLevel.LOW_IMPACT); // Reload the screen
                });
                let i = document.createElement("i");
                i.classList.add("fas", "fa-bars")
                item.appendChild(i);
                wrapperFaces.appendChild(item);
            })
        }
        menuBaseColors.appendChild(wrapperFaces);
        return wrapperFaces;
    }
}