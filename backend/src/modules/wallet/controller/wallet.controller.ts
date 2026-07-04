import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { sendSuccess } from '../../../core/response/ApiResponse'
import { MSG } from '../constants/messages'
import { IWalletService } from '../interfaces/wallet.service.interface'

@injectable()
export class WalletController {
    constructor(@inject(TOKENS.IWalletService) private _walletService: IWalletService) {}

    credit = async (req: Request, res: Response) => {
        const { amount, description, referenceId } = req.body
        const userId = req.user?.userId

        if (!userId) throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.UNAUTHORIZED)

        const result = await this._walletService.credit(userId, amount, description, referenceId)

        sendSuccess(res, MSG.CREDITED, result)
    }

    debit = async (req: Request, res: Response) => {
        const { amount, description, referenceId } = req.body
        const userId = req.user?.userId

        if (!userId) throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.UNAUTHORIZED)

        const result = await this._walletService.debit(userId, amount, description, referenceId)

        sendSuccess(res, MSG.DEBITED, result)
    }

    getWallet = async (req: Request, res: Response) => {
        const userId = req.user?.userId

        if (!userId) throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.UNAUTHORIZED)

        const result = await this._walletService.getWallet(userId)

        if (!result) throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.NOT_FOUND)

        sendSuccess(res, undefined, result)
    }
}
