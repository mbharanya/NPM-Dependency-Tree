import fetch from 'node-fetch'
import { Logger } from '@overnightjs/logger';


//TODO: could be extracted to config file
const API_URL = "https://registry.npmjs.org/:packageName/:version"

interface NpmJsDependencies {
    [packageName: string]: string;
}

interface Dependency {
    name: string;
    version: string;
}

export class Npm {
    async getDependencies(packageName: string, version: string = 'latest'): Promise<Dependency[]> {
        Logger.Info(`Fetching dependencies from npmjs for ${packageName}`)
        const response = await fetch(API_URL.replace(':packageName', packageName).replace(':version', version))
        const json = await response.json()
        const dependencies: NpmJsDependencies = json.dependencies

        if (!dependencies){
            throw new Error(`Package ${packageName}:${version} not found`)
        }

        return Object.keys(dependencies).map((key) => {
            return { name: key, version: dependencies[key] }
        });
    }
}