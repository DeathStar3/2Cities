import B from "./B";
import C from "./C";
import { C as Cbis } from './Cbis';
import D from "./D";
import H from "./H";
import I from "./I";
import K, {testType} from "./K";
import {N} from "usage/foo/bar/N";
import * as m from "m";
import {O} from "./O"

export default class A {

    b: B;
    cbis: Cbis;

    constructor(d: D) {
    }

    test(c: C, m: m.M) {
        const e = c.e; //sans default
        const f = c.f; //default
        const g = c.g();
        const h: H = c.h;
        const i = new I();
        const k = new K();
        const type: testType = "a";
        const l = this.b.getL();
        const n = new N();
        const anonyme = new class {};
        const anonyme2 = this.getAnonyme();
        const o = O.toString();
        const baseLibrary = new URL("");
    }

    getAnonyme() {
        return new class {}
    }

}
