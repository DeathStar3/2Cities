describe('in export project', () => {

    let links: Array<any> = require('../export/db_link.json').links;
    console.log(links)

    function exportLink(source: string, target: string) {
        return {source: "./exportTest/" + source, type: 'EXPORT', target: target};
    }

    function containsExport(source: string, target: string) {
        for (const usage of links) {
            if (usage.source === "./exportTest/" + source
                && usage.target === target
                && usage.type === "EXPORT")
                return true;
        }
        return false;
    }

    describe('concerning ExportOne', () => {
        it('exported by ExportOne', () => {
            expect(containsExport("ExportOne.ts", "ExportOne")).toBe(true);
        });
        it('exported by ExportTwo', () => {
            expect(containsExport("ExportTwo.ts", "ExportOne")).toBe(true);
        });
        it('exported by ExportThree', () => {
            expect(containsExport("ExportThree.ts", "ExportOne")).toBe(true);
        });
        it('exported by ExportFour', () => {
            expect(containsExport("ExportFour.ts", "ExportOne")).toBe(true);
        });
        it('exported by ExportFive', () => {
            expect(containsExport("ExportFive.ts", "ExportOne")).toBe(true);
        });
        it('exported by ExportSix', () => {
            expect(containsExport("ExportSix.ts", "ExportOne")).toBe(true);
        });
    });

    describe('concerning PThree', () => {
        it('exported by P', () => {
            expect(containsExport("P.ts", "PThree")).toBe(true);
        });
        it('exported by Pbis', () => {
            expect(containsExport("Pbis.ts", "PThree")).toBe(true);
        });
        it('exported by Pbisbis', () => {
            expect(containsExport("Pbisbis.ts", "PThree")).toBe(true);
        });
    });

    describe('concerning PTwo', () => {
        it('exported by P', () => {
            expect(containsExport("P.ts", "PTwo")).toBe(true);
        });
        it('exported by Pbis', () => {
            expect(containsExport("Pbis.ts", "PTwo")).toBe(true);
        });
        it('exported by Pbisbis', () => {
            expect(containsExport("Pbisbis.ts", "PTwo")).toBe(true);
        });
    });

    describe('concerning Pbis', () => {
        it('exported by P', () => {
            expect(containsExport("P.ts", "Pbis")).toBe(true);
        });
        it('exported by Pbisbis', () => {
            expect(containsExport("Pbisbis.ts", "Pbis")).toBe(true);
        });
    });

});
