import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";
@Injectable()
export class RequestMiddleware implements NestMiddleware {
    use(req:Request, res:Response, next:NextFunction) {
        const requestId = req.header('x-request-id') ?? randomUUID()
        
        req["requestId"] = requestId
        res.setHeader('X-Request-ID',requestId)

        next()
    } 
}