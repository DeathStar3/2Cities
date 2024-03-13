import {District} from './entities/district.interface';
import {Building} from './entities/building.interface';
import {Link} from "./entities/link.interface";

export class EntitiesList {
    buildings: Building[] = [];

    district: District; // [com] => [polytech, utils] => **[unice]**

    links: Link[] = [];

    file_district: District; // For files

    /**
     * @deprecated
     */
    compositionLinks: Link[] = [];

    constructor() {
      //
    }

    public getBuildingFromName(name: string): Building {
        for (const building of this.buildings) {
            if (building.name === name) {
                return building;
            }
        }
        let res = this.district.getBuildingFromName(name);
        if (res !== undefined) {
            return res;
        }
        res = this.file_district.getBuildingFromName(name);
        if (res !== undefined)
            return res;
        return undefined;
    }

    public filterCompLevel(level: number): EntitiesList {
        let result: EntitiesList = Object.assign({}, this);
        result.district = Object.assign([], this.district);

        const d = this.district.filterCompLevel(level);
        if (Array.isArray(d)) {
            result.district.districts = d[0];
            result.district.buildings = d[1];
        } else {
            result.district = d;
        }
        result.links = Object.assign([], this.links);

        let ar: Building[];
        ar = Object.assign([], this.district.buildings);
        ar.forEach(b => {
            result.district.buildings.push(b);
        });
        return result;
    }

    public getMaxCompLevel(): number {
        return this.district.getMaxCompLevel();
    }

    public getNumberOfBuildings(): number {
        return this.buildings.length + this.district.getNumberOfBuildings();
    }

    public getNumberOfDistricts(): number {
        return this.district === undefined ? 0 : this.district.getNumberOfDistricts();
    }
}