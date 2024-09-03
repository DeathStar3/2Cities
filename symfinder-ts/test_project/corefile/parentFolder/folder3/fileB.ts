import { load } from "js-yaml"
import { readFileSync } from "fs"

export class Configuration{

    properties: any = load(readFileSync('./neo4j.yaml', 'utf8'));

    getNeo4JBoltAdress(): string{
        return this.properties.neo4j.boltAddress
    }

    getNeo4JUser(): string{
        return this.properties.neo4j.ta
    }

    getNeo4JPassword(): string{
        return this.properties.neo4j.password
    }
}

const config = new Configuration()
export { config }