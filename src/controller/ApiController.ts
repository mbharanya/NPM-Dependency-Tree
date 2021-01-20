import { Request, Response } from 'express';
import { Controller, Middleware, Get, Put, Post, Delete } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import { Npm, PackageDependencies } from './npm/Npm';
import isValidNpmName from 'is-valid-npm-name';
import { Redis } from './cache/Redis';

@Controller('api/dependencies')
export class ApiController {
    private npm = new Npm()
    private redisClient = new Redis(process.env.REDIS_HOST || "redis", parseInt(process.env.REDIS_PORT || "6379"))

    @Get(':packageName/:version')
    async getMessage(req: Request, res: Response) {
        try {
            const packageName = req.params.packageName.trim()
            //TODO: validate version
            const version = req.params.version.trim()
            const valid = isValidNpmName(packageName);
            // need to do strict checking, returns truthy error strings
            if (valid === true) {
                const cachedDependencies = await this.redisClient.getDependency({ name: packageName, version: version })
                if (!cachedDependencies) {
                    try {
                        const dependencies = await this.npm.getDependencies(packageName, version)
                        this.redisClient.cacheDependency({ name: packageName, version: version }, dependencies)
                        this.cacheChildren(dependencies)
                        res.status(200).json(dependencies);
                    } catch (err) {
                        res.status(404).json({ error: err.message });
                    }

                } else {
                    res.status(200).json(JSON.parse(cachedDependencies));
                }
            } else {
                res.status(400).json({ error: `Illegal package name ${packageName}: ${valid}` });
            }
        } catch (err) {
            // TODO: Log level could be downgraded, depending on how often it occurs
            Logger.Warn(`Error fetching dependencies: ${err.message}`)
            res.status(404).json({ error: err.message });
        }
    }

    @Get('random')
    async getRandom(req: Request, res: Response) {
        try {
            const allKeys = await this.redisClient.getAllKeys()
            const randomCacheKey = allKeys[Math.floor(Math.random() * allKeys.length)]
            const cachedDependencies = await this.redisClient.get(randomCacheKey)
            res.status(200).json(cachedDependencies);
        } catch (err) {
            Logger.Warn(`Error fetching dependencies: ${err.message}`)
            res.status(404).json({ error: err.message });
        }
    }

    private async cacheChildren(packageDependencies: PackageDependencies) {
        packageDependencies.dependencies.forEach(async (p) => {
            const cacheKey = p.name + '/' + p.version;
            const cached = await this.redisClient.getDependency(p)
            if (!cached) {
                const deps = await this.npm.getDependencies(p.name, p.version)
                this.redisClient.client.setex(cacheKey, 600, JSON.stringify(deps));
            }
        })
    }


}
