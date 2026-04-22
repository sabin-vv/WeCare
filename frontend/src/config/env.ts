export const env = {
    AWS_BASE_URL: import.meta.env.VITE_S3_BASE_URL || 'https://your-bucket.s3.amazonaws.com',
    RAZORPAY_KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YourKeyHere',
}
