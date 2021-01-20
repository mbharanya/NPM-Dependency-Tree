import { Request, Response } from 'express';
import { Controller, Middleware, Get, Put, Post, Delete } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import { Npm, PackageDependencies } from './npm/Npm';
import isValidNpmName from 'is-valid-npm-name';
import { Redis } from './cache/Redis';
import {IController } from './Controller'
@Controller('api/dependencies')
export class ApiController implements IController {
    constructor(private npm: Npm, private redis: Redis){
    }

    @Get(':packageName/:version')
    async getMessage(req: Request, res: Response) {
        try {
            const packageName = req.params.packageName.trim()
            //IMPROVE: version could also be validated further
            const version = req.params.version.trim() || Npm.FALLBACK_VERSION
            const valid = isValidNpmName(packageName);
            // need to do strict checking, returns truthy error strings
            if (valid === true) {
                const cachedDependencies = await this.redis.getDependency({ name: packageName, version: version })
                if (!cachedDependencies) {
                    try {
                        const dependencies = await this.npm.getDependencies(packageName, version)
                        this.redis.cacheDependency({ name: packageName, version: version }, dependencies)
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
            // IMPROVE: Log level could be downgraded, depending on how often it occurs
            Logger.Warn(`Error fetching dependencies: ${err.message}`)
            res.status(404).json({ error: err.message });
        }
    }

    private async cacheChildren(packageDependencies: PackageDependencies) {
        packageDependencies.dependencies.forEach(async (p) => {
            const cacheKey = p.name + '/' + p.version;
            const cached = await this.redis.getDependency(p)
            if (!cached) {
                const deps = await this.npm.getDependencies(p.name, p.version)
                this.redis.client.setex(cacheKey, 600, JSON.stringify(deps));
            }
        })
    }


}
