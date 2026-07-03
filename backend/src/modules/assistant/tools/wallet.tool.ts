import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { IWalletService } from '../../wallet/interfaces/wallet.service.interface'

@injectable()
export class WalletTool {
    constructor(@inject(TOKENS.IWalletService) private readonly _walletService: IWalletService) {}

    async getBalance(userId: string): Promise<string | null> {
        const wallet = await this._walletService.getWallet(userId)
        if (!wallet) return null

        return `₹${wallet.balance.toLocaleString('en-IN')}`
    }

    async getRecentTransactions(userId: string): Promise<string | null> {
        const wallet = await this._walletService.getWallet(userId)
        if (!wallet || !wallet.transactions.length) return null

        return wallet.transactions
            .slice(0, 5)
            .map((t) => `- ${t.type === 'credit' ? '+' : '-'}₹${t.amount} | ${t.description} | ${new Date(t.createdAt).toLocaleDateString()}`)
            .join('\n')
    }

    async getContext(userId: string): Promise<string | null> {
        const balance = await this.getBalance(userId)
        if (!balance) return null
        return `Balance: ${balance}`
    }
}
