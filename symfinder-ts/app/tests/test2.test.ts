describe('in test2 unit test', () => {

    let data_file = require('../db.json');
    let size = Object.keys(data_file[0]).length;

    describe('concerning vp_folder', () => {
        it('parentFolder is not', () => {
            let types;
            for (let step = 0; step < size; step++) {
                if (data_file[0][step].name === 'parentFolder') {
                    types = data_file[0][step].types;
                    break;
                }
            }
            let result = types.includes('VP_FOLDER');
            expect(result).toBe(false);
        });
    });

    describe('concerning variant_folder', () => {
        it('folder1 is not', () => {
            let types;
            for (let step = 0; step < size; step++) {
                if (data_file[0][step].name === 'folder1') {
                    types = data_file[0][step].types;
                    break;
                }
            }
            let result = types.includes('VARIANT_FOLDER');
            expect(result).toBe(false);
        });
        it('folder2 is not', () => {
            let types;
            for (let step = 0; step < size; step++) {
                if (data_file[0][step].name === 'folder2') {
                    types = data_file[0][step].types;
                    break;
                }
            }
            let result = types.includes('VARIANT_FOLDER');
            expect(result).toBe(false);
        });
        it('folder3 is not', () => {
            let types;
            for (let step = 0; step < size; step++) {
                if (data_file[0][step].name === 'folder3') {
                    types = data_file[0][step].types;
                    break;
                }
            }
            let result = types.includes('VARIANT_FOLDER');
            expect(result).toBe(false);
        });
    });

    describe('concerning variant_file', () => {
        it('fileA is not', () => {
            let types;
            for (let step = 0; step < size; step++) {
                if (data_file[0][step].name === 'fileA.ts') {
                    types = data_file[0][step].types;
                    break;
                }
            }
            let result = types.includes('VARIANT_FILE');
            expect(result).toBe(false);
        });
        it('fileB is not', () => {
            let types;
            for (let step = 0; step < size; step++) {
                if (data_file[0][step].name === 'fileB.ts') {
                    types = data_file[0][step].types;
                    break;
                }
            }
            let result = types.includes('VARIANT_FILE');
            expect(result).toBe(false);
        });
        it('fileC is not', () => {
            let types;
            for (let step = 0; step < size; step++) {
                if (data_file[0][step].name === 'fileC.ts') {
                    types = data_file[0][step].types;
                    break;
                }
            }
            let result = types.includes('VARIANT_FILE');
            expect(result).toBe(false);
        });
    });
})
