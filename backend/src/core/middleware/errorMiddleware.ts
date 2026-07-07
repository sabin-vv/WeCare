import { NextFunction, Request, Response } from 'express'

import { AppError } from '../errors/AppError'
import { logger } from '../logger/logger'
import { ApiResponse } from '../response/ApiResponse'

export const errorMiddleware = (err: Error, req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json(ApiResponse.error(err.message))
    }
    logger.error(err)
    return res.status(500).json(ApiResponse.error(err.message || 'Internal server error'))
}
