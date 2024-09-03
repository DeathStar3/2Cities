import {ClassOne} from "./moduleA";

class ClassThree {

    constructor(cons: ClassOne) {
    }

    test(arg: ClassFour) {
        const a: ClassFive = arg.wow;
        const popopopo = arg.yup.nope;
        const c = ClassSeven.t;
    }

}

export class ClassFour {
    wow: ClassFive;
    yup: ClassSix;
}

export class ClassFive {

}

export class ClassSix {
    nope: ClassFive;
}

export class ClassSeven {
    static t: string
}
