import { Request, Response } from 'express';
import { Redis } from 'ioredis';

export type MyContext = {
    req: Request;
    res: Response;
    redisClient: Redis;
};
