import { UpdateQuery } from 'mongoose'

import { BaseRepository } from '../../../core/base/base.repository'
import { IWalletRepository } from '../interfaces/wallet.repository.interface'
import { WalletModel } from '../model/wallet.model'
import { WalletDocument } from '../types/wallet.types'

export class WalletRepository extends BaseRepository<WalletDocument> implements IWalletRepository {
    async findByUserId(userId: string): Promise<WalletDocument | null> {
        return await WalletModel.findOne({ userId })
    }

    async createWallet(userId: string): Promise<WalletDocument> {
        return await WalletModel.create({
            userId,
            balance: 0,
            transactions: [],
        })
    }

    async update(id: string, data: UpdateQuery<WalletDocument>): Promise<WalletDocument | null> {
        return await WalletModel.findByIdAndUpdate(id, data, { new: true })
    }
}
