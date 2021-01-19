import { Logger } from "@overnightjs/logger";
import * as redis from "redis";
import { RedisClient } from "redis";

export class Redis {
    client: RedisClient
    constructor(host: string, port: number) {
        this.client = redis.createClient(port, host);

        this.client.on("error", (err) => {
            Logger.Err(err)
        });
    }
}

