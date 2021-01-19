import * as bodyParser from 'body-parser';
import * as controllers from '../controller';
import { Server } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import { Controller } from '@overnightjs/core/lib/decorators/types';
import express from 'express';
import path from 'path';

class DefaultServer extends Server {

    private readonly SERVER_STARTED = 'Server started on port: ';

    constructor() {
        super(true);
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: true}));
        this.setupControllers();
    }

    private setupControllers(): void {
        const ctlrInstances = [];
        for (const name in controllers) {
            if (controllers.hasOwnProperty(name)) {
                const controller = (controllers as Controller)[name];
                ctlrInstances.push(new controller());
            }
        }
        super.addControllers(ctlrInstances);
    }

    public start(port: number): void {
        const dir = path.join(__dirname, '../../public/');
        // Set the static and views directory
        this.app.set('views',  dir);
        this.app.use(express.static(dir));
        // Serve front-end content
        this.app.get('*', (req, res) => {
            res.sendFile('index.html', {root: dir});
        });

        this.app.listen(port, () => {
            Logger.Info(this.SERVER_STARTED + port)
         });
    }
}

export default DefaultServer;
