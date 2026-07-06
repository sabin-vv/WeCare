export const DEFAULT_LOCALE = 'en-IN'

export const DEFAULT_CURRENCY = 'INR'

export const DATE_FORMAT = {
    SHORT: {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    },
    LONG: {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    },
    DATE_TIME: {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    },
    TIME: {
        hour: '2-digit',
        minute: '2-digit',
    },
} as const
