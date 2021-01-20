import { Request, Response } from 'express';
import { Controller, Middleware, Get, Put, Post, Delete } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import { Npm, PackageDependencies } from './npm/Npm';
import isValidNpmName from 'is-valid-npm-name';
import { Redis } from './cache/Redis';
import { IController } from './Controller';
import { versions } from 'process';

@Controller('api/versions')
export class VersionsController implements IController {
    constructor(private npm: Npm, private redis: Redis) {
    }

    @Get(':packageName')
    async getMessage(req: Request, res: Response) {
        try {
            const packageName = req.params.packageName.trim()
            const valid = isValidNpmName(packageName);
            // need to do strict checking, returns truthy error strings
            if (valid === true) {
                const key = `${packageName}/version`;
                const cached = await this.redis.get(key)
                if (!cached) {
                    const versions = await this.npm.getVersions(packageName)
                    this.redis.cache(key, JSON.stringify(versions))
                    res.status(200).json({ versions: versions })
                } else {
                    res.status(200).json({ versions: JSON.parse(cached) })
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


}
