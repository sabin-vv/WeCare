import { Response } from 'express'

import { HTTP_STATUS } from '../constants/httpStatus'

export class ApiResponse<T = undefined> {
    success: boolean
    message?: string
    data?: T

    private constructor(success: boolean, message?: string, data?: T) {
        this.success = success
        this.message = message
        this.data = data
    }

    static success<T>(data?: T, message?: string): ApiResponse<T> {
        return new ApiResponse(true, message, data)
    }

    static message(message: string): ApiResponse {
        return new ApiResponse(true, message)
    }

    static error(message: string): ApiResponse {
        return new ApiResponse(false, message)
    }
}

export const sendSuccess = (res: Response, message?: string, data?: unknown, statusCode: number = HTTP_STATUS.OK) =>
    res.status(statusCode).json(ApiResponse.success(data, message))


