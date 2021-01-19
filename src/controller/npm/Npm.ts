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

interface PackageDependencies {
    dependencies: Dependency[];
    devDependencies: Dependency[];
}

export class Npm {
    async getDependencies(packageName: string, version: string = 'latest'): Promise<PackageDependencies> {
        Logger.Info(`Fetching dependencies from npmjs for ${packageName}`)
        const response = await fetch(API_URL.replace(':packageName', packageName).replace(':version', version))
        const json = await response.json()
        const dependencies: NpmJsDependencies = json.dependencies
        const devDependencies: NpmJsDependencies = json.devDependencies

        if (!dependencies) {
            throw new Error(`Package ${packageName}:${version} not found`)
        }

        return {
            dependencies: this.npmFormatToDependencies(dependencies),
            devDependencies: this.npmFormatToDependencies(devDependencies)
        };
    }

    private npmFormatToDependencies(deps: NpmJsDependencies): Dependency[] {
        return Object.keys(deps).map((key) => {
            return { name: key, version: deps[key] }
        })
    }
}