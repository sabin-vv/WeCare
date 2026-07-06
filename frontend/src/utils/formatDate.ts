import { DEFAULT_LOCALE } from '../shared/constants/date.constants'

export const formatDate = (date: Date | string, options: Intl.DateTimeFormatOptions) => {
    return new Intl.DateTimeFormat(DEFAULT_LOCALE, options).format(new Date(date))
}
