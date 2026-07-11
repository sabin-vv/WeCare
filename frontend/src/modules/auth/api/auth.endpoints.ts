import { AUTH_API } from '@/shared/constants/api.constants'

export const AUTH_ENDPOINTS = {
    SEND_OTP: `${AUTH_API}/send-otp`,
    VERIFY_OTP: `${AUTH_API}/verify-otp`,
    REGISTER: `${AUTH_API}/register`,
    LOGIN: `${AUTH_API}/login`,
    LOGOUT: `${AUTH_API}/logout`,
    RESET_PASSWORD: `${AUTH_API}/reset-password`,
    REFRESH_TOKEN: `${AUTH_API}/refresh-token`,
    ME: `${AUTH_API}/me`,
    CHANGE_PASSWORD: `${AUTH_API}/change-password`,
} as const
