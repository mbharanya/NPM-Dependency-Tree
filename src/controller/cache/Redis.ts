import { Logger } from "@overnightjs/logger";
import * as redis from "redis";
import { RedisClient } from "redis";

export class Redis {
    client: RedisClient
    constructor(redisPort: number) {
        this.client = redis.createClient(redisPort);

        this.client.on("error", (err) => {
            Logger.Err(err)
        });
    }
}

