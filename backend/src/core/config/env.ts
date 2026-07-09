import dotenv from 'dotenv'

dotenv.config({ quiet: true })

export const env = {
    PORT: process.env.PORT || '5000',
    MONGO_URI: process.env.MONGODB_URI,
    EMAIL_USER: process.env.EMAIL_USER || 'vvsabin@gmail.com',
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || 'uinkkccprbykwpdf',
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || '',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',
    JWT_ACCESS_EXPIRES: '15m',
    JWT_REFRESH_EXPIRES: '7d',
    NODE_ENV: process.env.NODE_ENV,
    REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
    REDIS_PORT: process.env.REDIS_PORT || 6379,
    AWS_REGION: process.env.AWS_REGION || 'ap-south-1',
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourKeyHere',
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'YourSecretHere',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL,
    LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY || '',
    LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET || '',
    LIVEKIT_HOST: process.env.LIVEKIT_HOST || '',
    LIVEKIT_URL: process.env.LIVEKIT_URL || '',
}
