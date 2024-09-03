

describe('in proximity test project', () => {

    let data_file = require('../db.json');
    let size = Object.keys(data_file[0]).length;

    describe('concerning vp_folder', () => {
        it('parentFolder is', () => {
            let types;
            for (let step = 0; step < size; step++) {
                if (data_file[0][step].name === 'parentFolder') {
                    types = data_file[0][step].types;
                    break;
                }
            }
            let result = types.includes('VP_FOLDER');
            expect(result).toBe(true);
        });
    });

    describe('concerning variant_folder', () => {
        it ('folderA is', () => {
            let types;
            for (let step = 0; step < size; step++) {
                if (data_file[0][step].name === 'folderA') {
                    types = data_file[0][step].types;
                    break;
                }
            }
            let result = types.includes('VARIANT_FOLDER');
            expect(result).toBe(true);
        });
        it ('folderB is', () => {
            let types;
            for (let step = 0; step < size; step++) {
                if (data_file[0][step].name === 'folderB') {
                    types = data_file[0][step].types;
                    break;
                }
            }
            let result = types.includes('VARIANT_FOLDER');
            expect(result).toBe(true);
        });
        it ('folderC is', () => {
            let types;
            for (let step = 0; step < size; step++) {
                if (data_file[0][step].name === 'folderC') {
                    types = data_file[0][step].types;
                    break;
                }
            }
            let result = types.includes('VARIANT_FOLDER');
            expect(result).toBe(true);
        });
    });

    describe('concerning variant_file', () => {
        it('fileA is', () => {
            let types;
            for (let step = 0; step < size; step++) {
                if (data_file[0][step].name === 'fileA.ts') {
                    types = data_file[0][step].types;
                    break;
                }
            }
            let result = types.includes('VARIANT_FILE');
            expect(result).toBe(true);
        });
        it('fileB is', () => {
            let types;
            for (let step = 0; step < size; step++) {
                if (data_file[0][step].name === 'fileB.ts') {
                    types = data_file[0][step].types;
                    break;
                }
            }
            let result = types.includes('VARIANT_FILE');
            expect(result).toBe(true);
        });
    });
    
    describe('concerning super_variant_file', () => {
        it('fileA is', () => {
            let types;
            for (let step = 0; step < size; step++) {
                if (data_file[0][step].name === 'fileA.ts') {
                    types = data_file[0][step].types;
                    break;
                }
            }
            let result = types.includes('SUPER_VARIANT_FILE');
            expect(result).toBe(true);
        });
        it('fileB is not', () => {
            let types;
            for (let step = 0; step < size; step++) {
                if (data_file[0][step].name === 'fileB.ts') {
                    types = data_file[0][step].types;
                    break;
                }
            }
            let result = types.includes('SUPER_VARIANT_FILE');
            expect(result).toBe(false);
        });
    });
});