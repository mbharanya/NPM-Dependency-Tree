import { Logger } from "@overnightjs/logger";
import * as redis from "redis";
import { RedisClient } from "redis";
import { Dependency, PackageDependencies } from "../npm/Npm";

export class Redis {
    client: RedisClient
    constructor(host: string, port: number) {
        this.client = redis.createClient(port, host);

        this.client.on("error", (err) => {
            Logger.Err(err)
        });
    }

    dependency2Key(dependency: Dependency): string {
        return dependency.name + "/" + dependency.version
    }

    cache(key: string, value: string): boolean {
        return this.client.setex(key, 600, value);
    }

    cacheDependency(dependency: Dependency, childDependencies: PackageDependencies ): boolean {
        const key = this.dependency2Key(dependency);
        return this.cache(key, JSON.stringify(childDependencies))
    }

    getDependency(dependency: Dependency): Promise<string | null> {
        const key = this.dependency2Key(dependency);
        return this.get(key)
    }

    get(key: string): Promise<string | null> {
        return new Promise((resolve, reject) => this.client.get(key, (err, res) => {
            if (err) {
                reject(err);
            }
            resolve(res)
        }))
    }
}

