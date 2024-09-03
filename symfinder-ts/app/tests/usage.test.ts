describe('in usage project', () => {

    let linkscompose: Array<any> = require('../export/db_link.json').linkscompose;
    console.log(linkscompose)

    function usage(source: string, target: string) {
        return {source: "./usage/" + source, type: 'USAGE', target: "./usage/" + target};
    }

    function containsUsage(source: string, target: string) {
        for (const usage of linkscompose) {
            if (usage.source === "./usage/" + source
                && usage.target === "./usage/" + target
                && usage.type === "USAGE")
                return true;
        }
        return false;
    }

    describe('concerning B', () => {
        it('used by A by the field b', () => {
            expect(containsUsage("A.ts", "B.ts")).toBe(true);
        });
    });

    describe('concerning Cbis', () => {
        it('used by A by the field cbis', () => {
            expect(containsUsage("A.ts", "Cbis.ts")).toBe(true);
        });
    });

    describe('concerning D', () => {
        it('used by A by the constructor argument d', () => {
            expect(containsUsage("A.ts", "D.ts")).toBe(true);
        });
    });

    describe('concerning C', () => {
        it('used by A by the method argument c', () => {
            expect(containsUsage("A.ts", "C.ts")).toBe(true);
        });
    });

    describe('concerning E', () => {
        it('used by A by the variable e', () => {
            expect(containsUsage("A.ts", "E.ts")).toBe(true);
        });
        it('used by C by the property e', () => {
            expect(containsUsage("C.ts", "E.ts")).toBe(true);
        });
    });

    describe('concerning F', () => {
        it('used by A by the variable f', () => {
            expect(containsUsage("A.ts", "F.ts")).toBe(true);
        });
        it('used by C by the property f', () => {
            expect(containsUsage("C.ts", "F.ts")).toBe(true);
        });
    });

    describe('concerning G', () => {
        it('used by A by the variable g', () => {
            expect(containsUsage("A.ts", "G.ts")).toBe(true);
        });
        it('used by C by the function g', () => {
            expect(containsUsage("C.ts", "G.ts")).toBe(true);
        });
    });

    describe('concerning H', () => {
        it('used by A by the variable h', () => {
            expect(containsUsage("A.ts", "H.ts")).toBe(true);
        });
        it('used by C by the property h', () => {
            expect(containsUsage("C.ts", "H.ts")).toBe(true);
        });
    });

    describe('concerning I', () => {
        it('used by A by the variable i', () => {
            expect(containsUsage("A.ts", "I.ts")).toBe(true);
        });
    });

    describe('concerning K', () => {
        it('used by A by the variable k', () => {
            expect(containsUsage("A.ts", "K.ts")).toBe(true);
        });
    });

    describe('concerning testType', () => {
        it('used by A by the variable type', () => {
            expect(containsUsage("A.ts", "testType.ts")).toBe(true);
        });
    });

    describe('concerning L', () => {
        it('used by A by the variable l', () => {
            expect(containsUsage("A.ts", "L.ts")).toBe(true);
        });
        it('used by B by the method getL', () => {
            expect(containsUsage("A.ts", "L.ts")).toBe(true);
        });
    });

    describe('concerning N', () => {
        it('used by A by the variable n', () => {
            expect(containsUsage("A.ts", "N.ts")).toBe(true);
        });
    });

    describe('concerning URL', () => {
        it('used by A by the variable baseLibrary', () => {
            expect(containsUsage("A.ts", "URL.ts")).toBe(true);
        });
    });

    describe('concerning JIntern', () => {
        it('used by J by the variable intern', () => {
            expect(containsUsage("J.ts", "JIntern.ts")).toBe(true);
        });
    });

});
