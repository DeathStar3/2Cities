import '@material/mwc-button/mwc-button';
import '@material/mwc-dialog';
import '@material/mwc-formfield/mwc-formfield';
import '@material/mwc-radio/mwc-radio';
import {UIController} from './controller/ui/ui.controller';
import {ProjectService} from './services/project.service';
import {InputKeyController} from "./controller/ui/input-key.controller";

class Main {

    constructor() {
        UIController.setBackgroundColorSameAsCanvas();
        UIController.createSaveSection();
        UIController.createLogs();

        ProjectService.findAllProjectsName().then((response) => {
            const projects = response.data;
            console.log("projects", projects);

            UIController.createProjectSelector(projects);
            UIController.createMenu();

            //Open project and config selection dialog box
            UIController.createProjectSelectorStayOpen();

            UIController.initSearchbar();
            UIController.parseQueryParameters();
            InputKeyController.createInputKeyListener()
        })
    }
}

new Main();
