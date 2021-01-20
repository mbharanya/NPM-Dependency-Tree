import fetch from 'node-fetch'
import { Logger } from '@overnightjs/logger';
import * as semver from 'semver';

//IMPROVE: could be extracted to config file
const BASE_API_URL = "https://registry.npmjs.org/:packageName"
const API_URL = BASE_API_URL + "/:version"

interface NpmJsDependencies {
    [packageName: string]: string;
}
export interface Dependency {
    name: string;
    version: string;
}

export interface PackageDependencies {
    dependencies: Dependency[];
    devDependencies: Dependency[];
}

export class Npm {
    static readonly FALLBACK_VERSION = "latest";

    async getDependencies(packageName: string, version: string = 'latest'): Promise<PackageDependencies> {
        const minimumVersion = await this.getSanitizedVersion(packageName, version);
        if (!minimumVersion) {
            throw new Error(`Invalid version ${version}`);
        }

        const url = API_URL.replace(':packageName', packageName).replace(':version', minimumVersion)
        Logger.Info(`Fetching dependencies from npmjs for ${url}`)
        const response = await fetch(url)
        const json = await response.json()
        if (response.status === 200) {
            const dependencies: NpmJsDependencies = json.dependencies
            const devDependencies: NpmJsDependencies = json.devDependencies

            return {
                dependencies: this.npmFormatToDependencies(dependencies),
                devDependencies: this.npmFormatToDependencies(devDependencies)
            };
        } else if (response.status === 404 || response.status === 405) {
            throw new Error(`Package ${packageName}:${version} not found`)
        } else {
            throw new Error(`Could not fetch package ${packageName}:${version} ${await response.text()}`)
        }
    }

    async getVersions(packageName: string): Promise<string[]> {
        const response = await fetch(BASE_API_URL.replace(":packageName", packageName))
        if (response.status === 200) {
            const json = await response.json()
            return Object.keys(json.versions)
        } else if (response.status === 404 || response.status === 405) {
            throw new Error(`Package ${packageName} not found`)
        } else {
            throw new Error(`Could not fetch version for ${packageName}`)
        }
    }

    private async getSanitizedVersion(packageName: string, version: string): Promise<string | null> {
        switch (version) {
            case "*":
            case Npm.FALLBACK_VERSION:
                return Npm.FALLBACK_VERSION;
            default:
                //IMPROVE: could further optimize not doing two requests by checking if the semver actually allows higher version
                const versions = await this.getVersions(packageName)
                return semver.maxSatisfying(versions, version);
        }
    }

    private npmFormatToDependencies(deps: NpmJsDependencies): Dependency[] {
        if (!deps) return []
        return Object.keys(deps).map((key) => {
            return { name: key, version: deps[key] }
        })
    }
}