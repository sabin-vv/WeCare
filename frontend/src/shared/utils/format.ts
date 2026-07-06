import { DATE_FORMAT, DEFAULT_CURRENCY, DEFAULT_LOCALE } from '../constants/locale.constants'

export { DATE_FORMAT }

export const formatDate = (date: Date | string, options: Intl.DateTimeFormatOptions) => {
    return new Intl.DateTimeFormat(DEFAULT_LOCALE, options).format(new Date(date))
}

export const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(DEFAULT_LOCALE, {
        style: 'currency',
        currency: DEFAULT_CURRENCY,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
