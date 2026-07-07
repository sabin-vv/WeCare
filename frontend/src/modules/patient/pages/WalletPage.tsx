import { ArrowDown, ArrowUp } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'

import { createWalletTopupOrder, getWallet, verifyWalletTopup } from '../api/patient.api'
import type { VerifyWalletTopupPayload } from '../api/patient.api'
import { SUGGESTED_AMOUNTS } from '../constants/patient.constants'
import type { Transactions } from '../types/patient.types'

import styles from './WalletPage.module.css'

import { env } from '@/config/env'
import Button from '@/shared/components/Button/Button'
import MainWrapper from '@/shared/components/MainWrapper/MainWrapper'
import Modal from '@/shared/components/Modal/Modal'
import { DATE_FORMAT, formatDate } from '@/shared/utils/format'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { loadRazorpayScript } from '@/utils/loadRazorpay'

const WalletPage = () => {
    const [balance, setBalance] = useState<number>(0)
    const [transactions, setTransactions] = useState<Transactions[]>([])
    const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false)
    const [amount, setAmount] = useState('')
    const [isAddingMoney, setIsAddingMoney] = useState(false)

    const pendingOrderIdRef = useRef<string | null>(null)

    const getWalletDetails = useCallback(async () => {
        const res = await getWallet()
        setBalance(res.data.balance)
        setTransactions(res.data.transactions)
    }, [])

    useEffect(() => {
        getWalletDetails()
    }, [getWalletDetails])

    const closeAddMoneyModal = () => {
        if (isAddingMoney) return
        setIsAddMoneyModalOpen(false)
        setAmount('')
    }

    const handleAmountChange = (value: string) => {
        if (/^\d*$/.test(value)) {
            setAmount(value)
        }
    }

    const handleAddMoney = async () => {
        const parsedAmount = Number(amount)

        if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
            toast.error('Enter a valid amount')
            return
        }

        setIsAddingMoney(true)
        try {
            const orderData = await createWalletTopupOrder(parsedAmount)
            const { orderId, amount: orderAmount, currency, keyId } = orderData.data

            pendingOrderIdRef.current = orderId
            setIsAddingMoney(false)

            await loadRazorpayScript()

            const options = {
                key: keyId || env.RAZORPAY_KEY_ID,
                amount: orderAmount,
                currency,
                name: 'WeCare',
                description: 'Wallet top-up',
                order_id: orderId,
                handler: async (razorpayResponse: {
                    razorpay_order_id: string
                    razorpay_payment_id: string
                    razorpay_signature: string
                }) => {
                    pendingOrderIdRef.current = null
                    try {
                        const payload: VerifyWalletTopupPayload = {
                            razorpayOrderId: razorpayResponse.razorpay_order_id,
                            razorpayPaymentId: razorpayResponse.razorpay_payment_id,
                            razorpaySignature: razorpayResponse.razorpay_signature,
                        }
                        const verifyResult = await verifyWalletTopup(payload)
                        setBalance(verifyResult.data.balance)
                        await getWalletDetails()
                        toast.success('Money added to wallet!')
                        setIsAddMoneyModalOpen(false)
                        setAmount('')
                    } catch (err) {
                        toast.error(getErrorMessage(err))
                    }
                },
                prefill: {},
                theme: { color: '#5f55ff' },
            }

            const rzp = new window.Razorpay(options)

            rzp.on('payment.failed', (_origin: unknown, error: { description: string }) => {
                pendingOrderIdRef.current = null
                toast.error(`Payment failed: ${error.description}`)
            })

            rzp.on('modal.closed', () => {
                pendingOrderIdRef.current = null
            })

            rzp.open()
        } catch (error) {
            toast.error(getErrorMessage(error))
            setIsAddingMoney(false)
        }
    }

    return (
        <>
            <MainWrapper title="My Wallet" subtitle="Manage payment and transaction history">
                <div className={styles.walletPage}>
                    <div className={styles.walletCard}>
                        <div className={styles.walletTop}>
                            <div>
                                <p className={styles.walletLabel}>WeCare Wallet</p>
                                <h2 className={styles.balanceTitle}>Available Balance</h2>
                            </div>

                            <div className={styles.walletIcon}>💳</div>
                        </div>

                        <div className={styles.walletBottom}>
                            <h1 className={styles.balanceAmount}>₹ {balance.toLocaleString()}</h1>

                            <Button
                                className={styles.addMoneyBtn}
                                type="button"
                                onClick={() => setIsAddMoneyModalOpen(true)}
                            >
                                + Add Money
                            </Button>
                        </div>
                    </div>

                    <div className={styles.transactionSection}>
                        <div className={styles.transactionHeader}>
                            <h4>Transaction History</h4>

                            <button className={styles.viewAllBtn}></button>
                        </div>

                        <div className={styles.transactionList}>
                            {transactions.length > 0 ? (
                                transactions.map((transaction, index) => (
                                    <div key={index} className={styles.transactionCard}>
                                        <div className={styles.transactionLeft}>
                                            <span
                                                className={`${styles.typeBadge} ${transaction.type === 'credit' ? styles.creditBadge : styles.debitBadge}`}
                                            >
                                                {transaction.type === 'credit' ? (
                                                    <ArrowUp size={12} strokeWidth={2.5} />
                                                ) : (
                                                    <ArrowDown size={12} strokeWidth={2.5} />
                                                )}
                                                {transaction.type}
                                            </span>

                                            <div className={styles.transactionMeta}>
                                                {transaction.description ? (
                                                    <span className={styles.transactionDesc}>
                                                        {transaction.description}
                                                    </span>
                                                ) : null}
                                                <span className={styles.transactionDate}>
                                                    {formatDate(transaction.createdAt, DATE_FORMAT.SHORT)}
                                                </span>
                                            </div>
                                        </div>

                                        <span className={transaction.type === 'credit' ? styles.credit : styles.debit}>
                                            {transaction.type === 'credit' ? '+' : '-'}₹
                                            {transaction.amount.toLocaleString()}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.emptyState}>
                                    <p>No transactions available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </MainWrapper>

            <Modal isOpen={isAddMoneyModalOpen} onClose={closeAddMoneyModal} title="Add Money" size="sm">
                <div className={styles.addMoneyForm}>
                    <label className={styles.amountLabel} htmlFor="wallet-add-money-amount">
                        Amount
                    </label>
                    <div className={styles.amountInputWrapper}>
                        <span className={styles.currencyPrefix}>₹</span>
                        <input
                            id="wallet-add-money-amount"
                            className={styles.amountInput}
                            inputMode="numeric"
                            placeholder="0"
                            value={amount}
                            disabled={isAddingMoney}
                            onChange={(event) => handleAmountChange(event.target.value)}
                        />
                    </div>

                    <div className={styles.suggestedSection}>
                        <span className={styles.suggestedLabel}>Suggested</span>
                        <div className={styles.suggestedGrid}>
                            {SUGGESTED_AMOUNTS.map((suggestedAmount) => (
                                <button
                                    key={suggestedAmount}
                                    className={`${styles.suggestedBtn} ${Number(amount) === suggestedAmount ? styles.selectedSuggestedBtn : ''}`}
                                    type="button"
                                    disabled={isAddingMoney}
                                    onClick={() => setAmount(String(suggestedAmount))}
                                >
                                    ₹{suggestedAmount}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        className={styles.proceedBtn}
                        type="button"
                        isLoading={isAddingMoney}
                        disabled={!amount}
                        onClick={handleAddMoney}
                    >
                        Proceed to Payment
                    </Button>
                </div>
            </Modal>
        </>
    )
}

export default WalletPage
