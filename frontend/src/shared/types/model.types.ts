export interface PatientRegister {
    name: string
    email: string
    dateOfBirth: string
    gender: string
    mobile: string
    password: string
    confirmPassword: string
}

export interface RazorpayOptions {
    key: string
    amount: number
    currency: string
    name: string
    description: string
    order_id: string
    handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void
    prefill?: Record<string, string>
    theme?: { color: string }
}
