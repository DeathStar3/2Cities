import {SearchbarController} from './searchbar.controller';
import {Building3D} from './../../view/common/3Delements/building3D';
import {Color} from '../../model/entities/config.interface';
import {Config, CriticalLevel} from '../../model/entitiesImplems/config.model';
import {SceneRenderer} from '../../view/sceneRenderer';
import {ConfigController} from './config.controller';
import {DetailsController} from './details.controller';
import {ProjectController} from './project-selector.controller';
import {LogsController} from "./logs.controller";
import {DocController} from "./doc.controller";
import {ConfigSelectorController} from "./config-selector.controller";
import {ConfigLoader} from "../parser/configLoader";

export class UIController {

    public static scene: SceneRenderer;
    public static configs: Config[];
    public static config: Config;

    public static createHeader(): void {

    }

    public static createDoc(): void {
        DocController.buildDoc();
    }

    public static initSearchbar(): void {
        SearchbarController.initMap();
    }

    public static addEntry(k: string, v: Building3D): void {
        SearchbarController.addEntry(k, v);
    }

    public static clearMap() {
        SearchbarController.emptyMap();
    }

    public static createProjectSelector(keys: string[]): void {
        ProjectController.createProjectSelector(keys);
    }

    public static createConfigSelector(configs: Config[], filename: string): void {
        this.configs = configs;
        ConfigSelectorController.createConfigSelector(configs, filename);
    }

    public static createConfig(config: Config): void {
        this.config = config;
        ConfigController.createConfigFolder(config);
    }

    public static createLogs() {
        LogsController.createLogsDisplay();
    }

    public static displayObjectInfo(obj: Building3D, force: boolean = false): void {
        DetailsController.displayObjectInfo(obj, force);
    }

    public static createFooter(): void {

    }


    public static reloadConfigAndConfigSelector(filename: string) {
        this.configs = ConfigLoader.loadConfigFiles(filename);
        this.createConfigSelector(this.configs, filename);
        this.createConfig(this.configs[0])
    }

    public static changeConfig(arr: string[], value: [string, string] | Color) {
        let critical: CriticalLevel = Config.alterField(this.config, arr, value);
        console.log(this.config);
        if (this.scene) {
            SearchbarController.emptyMap();
            switch (critical) {
                case CriticalLevel.LOW_IMPACT: // Only change the colour, so simple rerender
                case CriticalLevel.RERENDER_SCENE: // Changed variables important enough to warrant a complete rebuilding of the scene
                    this.scene = this.scene.rerender(this.config);
                    this.scene.buildScene();
                    LogsController.updateLogs(this.scene.entitiesList);
                    break;
                case CriticalLevel.REPARSE_DATA: // Changed variables that modify the parsing method, need to reparse the entire file and rebuild
                    // TODO fix issue when adding a new Entrypoint, the scene is only loading the new entry point class and not all the others, but it works after clicking on the config again
                    // ProjectController.reParse();
                    ConfigSelectorController.reParse();
                    break;
                default:
                    throw new Error("didn't receive the correct result from altering config field: " + critical);
            }
        } else {
            console.log("not initialized");
        }
    }
}
