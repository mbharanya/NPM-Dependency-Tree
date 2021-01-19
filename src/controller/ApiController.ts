import { Request, Response } from 'express';
import { Controller, Middleware, Get, Put, Post, Delete } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import { Npm } from './npm/Npm';
import isValidNpmName from 'is-valid-npm-name';
import { Redis } from './cache/Redis';

@Controller('api/dependencies')
export class ApiController {
    private npm = new Npm()
    //TODO: use env
    private redisClient = new Redis(6379)

    @Get(':packageName/:version')
    async getMessage(req: Request, res: Response) {
        try {
            const packageName = req.params.packageName.trim()
            //TODO: validate version
            const version = req.params.version.trim()
            const valid = isValidNpmName(packageName);
            // need to do strict checking, returns truthy error strings
            if (valid === true) {
                const cacheKey = packageName + '/' + version;
                this.redisClient.client.get(cacheKey, async (err, cacheDependencies) => {
                    if (err) throw err;

                    if (!cacheDependencies) {
                        const dependencies = await this.npm.getDependencies(packageName, version)
                        this.redisClient.client.setex(cacheKey, 600, JSON.stringify(dependencies));
                        res.status(200).json(dependencies);
                    }else{
                        res.status(200).json(JSON.parse(cacheDependencies));
                    }
                })
            } else {
                res.status(400).json({ error: `Illegal package name ${packageName}: ${valid}` });
            }
        } catch (err) {
            // TODO: Log level could be downgraded, depending on how often it occurs
            Logger.Warn(`Error fetching dependencies: ${err.message}`)
            res.status(404).json({ error: err.message });
        }
    }

}
