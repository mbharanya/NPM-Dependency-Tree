import { Request, Response } from 'express';
import { Controller, Middleware, Get, Put, Post, Delete } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import { Npm } from './npm/Npm';
import isValidNpmName from 'is-valid-npm-name';

@Controller('api/dependencies')
export class ApiController {
    private npm = new Npm()

    @Get(':packageName')
    async getMessage(req: Request, res: Response) {
        try {
            const packageName = req.params.packageName.trim()
            const valid = isValidNpmName(packageName);
            // need to do strict checking, returns truthy error strings
            if (valid === true) {
                const dependencies = await this.npm.getDependencies(packageName)
                res.status(200).json(dependencies);
            } else {
                res.status(400).json({ error: `Illegal package name ${packageName}: ${valid}` });
            }
        } catch (err) {
            // TODO: Log level could be downgraded, depending on how often it occurs
            Logger.Warn(`Error fetching dependencies: ${err.message}`)
            res.status(404).json({ error: err.message });
        }
    }

    // @Get(':msg')
    // getMessage(req: Request, res: Response) {
    //     Logger.Info(req.params.msg);
    //     res.status(200).json({
    //         message: req.params.msg,
    //     });
    // }

    // @Put(':msg')
    // putMessage(req: Request, res: Response) {
    //     Logger.Info(req.params.msg);
    //     return res.status(400).json({
    //         error: req.params.msg,
    //     });
    // }

    // @Post(':msg')
    // postMessage(req: Request, res: Response) {
    //     Logger.Info(req.params.msg);
    //     return res.status(400).json({
    //         error: req.params.msg,
    //     });
    // }

    // @Delete(':msg')
    // delMessage(req: Request, res: Response) {
    //     try {
    //         throw new Error(req.params.msg);
    //     } catch (err) {
    //         Logger.Err(err, true);
    //         return res.status(400).json({
    //             error: req.params.msg,
    //         });
    //     }
    // }
}
