import fetch from 'node-fetch'
import { Logger } from '@overnightjs/logger';
import * as semver from 'semver';

//TODO: could be extracted to config file
const API_URL = "https://registry.npmjs.org/:packageName/:version"

interface NpmJsDependencies {
    [packageName: string]: string;
}

interface Dependency {
    name: string;
    version: string;
}

export interface PackageDependencies {
    dependencies: Dependency[];
    devDependencies: Dependency[];
}

export class Npm {
    private static readonly FALLBACK_VERSION = "latest";

    async getDependencies(packageName: string, version: string = 'latest'): Promise<PackageDependencies> {
        const minimumVersion = this.getSanitizedVersion(version);

        const url = API_URL.replace(':packageName', packageName).replace(':version', minimumVersion || 'latest')
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

    private getSanitizedVersion(version: string) {
        switch (version) {
            case "*":
            case Npm.FALLBACK_VERSION:
                return Npm.FALLBACK_VERSION;
            default:
                return semver.minVersion(version)?.version || Npm.FALLBACK_VERSION;
        }
    }

    private npmFormatToDependencies(deps: NpmJsDependencies): Dependency[] {
        if (!deps) return []
        return Object.keys(deps).map((key) => {
            return { name: key, version: deps[key] }
        })
    }
}