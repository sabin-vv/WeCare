import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { env } from '../../../core/config/env'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { sendSuccess } from '../../../core/response/ApiResponse'
import { MSG } from '../constants/messages'
import { IAuthService } from '../interfaces/auth.service.interface'
import { UserRole } from '../types/auth.types'

const isProduction = env.NODE_ENV === 'production'

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
}

@injectable()
export class AuthController {
    constructor(@inject(TOKENS.IAuthService) private _authService: IAuthService) {}

    register = async (req: Request, res: Response) => {
        const { confirmPassword: _confirmPassword, ...cleanDto } = req.body
        const result = await this._authService.register(cleanDto)

        sendSuccess(res, MSG.USER_CREATED, result, HTTP_STATUS.CREATED)
    }

    sendOtp = async (req: Request, res: Response) => {
        const { email, purpose } = req.body

        await this._authService.sendOtp(email, purpose)

        sendSuccess(res, MSG.OTP_SENT)
    }

    verifyOtp = async (req: Request, res: Response) => {
        const { email, otp } = req.body

        await this._authService.verifyOtp(email, otp)

        sendSuccess(res, MSG.OTP_VERIFIED)
    }

    login = async (req: Request, res: Response) => {
        const { email, password, role } = req.body

        const result = await this._authService.login(email, password, role)

        const { accessToken, refreshToken } = result.tokens

        res.cookie('accessToken', accessToken, cookieOptions)
        res.cookie('refreshToken', refreshToken, cookieOptions)

        sendSuccess(res, MSG.LOGIN_SUCCESS, result.user)
    }

    refreshToken = async (req: Request, res: Response) => {
        const refreshToken = req.cookies?.refreshToken
        const { accessToken } = await this._authService.refreshToken(refreshToken)

        res.cookie('accessToken', accessToken, cookieOptions)

        sendSuccess(res, MSG.TOKEN_REFRESHED)
    }

    resetPassword = async (req: Request, res: Response) => {
        await this._authService.resetPassword(req.body)

        sendSuccess(res, MSG.PASSWORD_RESET)
    }

    logout = async (_req: Request, res: Response) => {
        res.clearCookie('accessToken', cookieOptions)
        res.clearCookie('refreshToken', cookieOptions)

        sendSuccess(res, MSG.LOGGED_OUT)
    }

    getCurrentUser = async (req: Request, res: Response) => {
        const userId = req?.user?.userId
        const role = req?.user?.role as UserRole

        const user = await this._authService.getCurrentUser(userId!, role)

        sendSuccess(res, undefined, user)
    }

    changePassword = async (req: Request, res: Response) => {
        const userId = req?.user?.userId

        await this._authService.changePassword(userId!, req.body)

        sendSuccess(res, MSG.PASSWORD_CHANGED)
    }
}
