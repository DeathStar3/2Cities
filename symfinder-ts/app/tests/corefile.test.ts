describe('in core_file test project', () => {

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
        it('folder 2 is not', () => { 
            let types;
            for (let step = 0; step < size; step++) {
                if (data_file[0][step].name === 'folder2') {
                    types = data_file[0][step].types;
                    break;
                }
            }
            let result = types.includes('VP_FOLDER');
            expect(result).toBe(false);
        });
    });

    describe('concernign variant_folder', () => {
        it('folder 1 is', () => { 
            let types;
            for (let step = 0; step < size; step++) {
                if (data_file[0][step].name === 'folder1') {
                    types = data_file[0][step].types;
                    break;
                }
            }
            let result = types.includes('VARIANT_FOLDER');
            expect(result).toBe(true);
        });
        it('folder 2 is', () => { 
            let types;
            for (let step = 0; step < size; step++) {
                if (data_file[0][step].name === 'folder2') {
                    types = data_file[0][step].types;
                    break;
                }
            }
            let result = types.includes('VARIANT_FOLDER');
            expect(result).toBe(true);
        });
        it('folder 3 is', () => { 
            let types;
            for (let step = 0; step < size; step++) {
                if (data_file[0][step].name === 'folder3') {
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
        it('fileA is not', () => { 
            let types;
            for (let step = 0; step < size; step++) {
                if (data_file[0][step].name === 'fileA.ts') {
                    types = data_file[0][step].types;
                    break;
                }
            }
            let result = types.includes('SUPER_VARIANT_FILE');
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
            let result = types.includes('SUPER_VARIANT_FILE');
            expect(result).toBe(false);
        });
    });
});