export declare class Configuration {
    runner: string;
    properties: any;
    constructor(runner: string);
    getNeo4JBoltAdress(): string;
    getNeo4JUser(): string;
    getNeo4JPassword(): string;
}
