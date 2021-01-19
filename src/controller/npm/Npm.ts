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
        const url = API_URL.replace(':packageName', packageName).replace(':version', version)
        Logger.Info(`Fetching dependencies from npmjs for ${url}`)
        const response = await fetch(url)
        const json = await response.json()

        if (!json) {
            throw new Error(`Package ${packageName}:${version} not found`)
        }

        const dependencies: NpmJsDependencies = json.dependencies
        const devDependencies: NpmJsDependencies = json.devDependencies

        return {
            dependencies: this.npmFormatToDependencies(dependencies),
            devDependencies: this.npmFormatToDependencies(devDependencies)
        };
    }

    private npmFormatToDependencies(deps: NpmJsDependencies): Dependency[] {
        if (!deps) return []
        return Object.keys(deps).map((key) => {
            return { name: key, version: deps[key] }
        })
    }
}