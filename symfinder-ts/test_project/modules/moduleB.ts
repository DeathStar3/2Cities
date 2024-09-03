import { ClassOne as ClassOneOne } from './moduleA';
import ClassOne from './moduleAbis';
import {a} from './moduleC';

class ClassTwo{

    one: ClassOne;
    oneBis: ClassOneOne;

    constructor(){

    }

    init(){
        return 0;
    }
}