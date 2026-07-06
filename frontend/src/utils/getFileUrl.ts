import { env } from '@/config/env'

export const getFileUrl = (path: string | undefined) => {
    if (!path) return ''
    if (path.startsWith('http')) return path

    return `${env.AWS_BASE_URL}${path}`
}
