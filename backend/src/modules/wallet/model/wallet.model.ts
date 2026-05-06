import { model, Schema, Types } from 'mongoose'

import { WalletDocument } from '../types/wallet.types'

const walletSchema = new Schema<WalletDocument>(
    {
        userId: {
            type: Types.ObjectId,
            ref: 'Patient',
            required: true,
        },
        balance: {
            type: Number,
            required: true,
            default: 0,
        },
        transactions: [
            {
                type: {
                    type: String,
                    enum: ['credit', 'debit'],
                    required: true,
                },
                amount: {
                    type: Number,
                    required: true,
                },
                referenceId: {
                    type: Types.ObjectId,
                },
                description: {
                    type: String,
                },
                createdAt: {
                    type: Date,
                    required: true,
                },
            },
        ],
    },
    { timestamps: true },
)

export const WalletModel = model<WalletDocument>('Wallet', walletSchema)
