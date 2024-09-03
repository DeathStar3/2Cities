import {writeFile} from "fs";

export class FileStats {

    files_count = 0;
    variants_count = 0;
    nodes_count = 0;
    relationships_count = 0;
    unknown_paths_count = 0;
    unknown_export_sources = 0;

    write() {
        writeFile('result_stats.json', JSON.stringify(this), {flag: "w"}, (err: any) => {
            if (err) throw err;
            console.log('stats written to file');
        });
    }

}
