import type { RazorpayOptions } from '@/shared/types/model.types'

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'

export const loadRazorpayScript = (): Promise<void> => {
    if (window.Razorpay) {
        return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = RAZORPAY_SCRIPT_URL
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Failed to load Razorpay'))
        document.head.appendChild(script)
    })
}

declare global {
    interface Window {
        Razorpay: {
            new (options: RazorpayOptions): {
                open(): void
                on(event: 'payment.failed', handler: (origin: unknown, error: { description: string }) => void): void
                on(event: 'modal.closed', handler: () => void): void
            }
        }
    }
}
