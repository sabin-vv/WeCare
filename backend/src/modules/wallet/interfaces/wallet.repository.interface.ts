import { UpdateQuery } from 'mongoose'

import { WalletDocument } from '../types/wallet.types'

export interface IWalletRepository {
    findByUserId(userId: string): Promise<WalletDocument | null>

    createWallet(userId: string): Promise<WalletDocument>

    update(walletId: string, data: UpdateQuery<WalletDocument>): Promise<WalletDocument | null>
}
