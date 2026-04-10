import type { ApiInterface } from '@/modules/auth/api/auth.api.types'
import { api } from '@/services/api'

export const updateProfile = async (data: FormData): Promise<ApiInterface> => {
    const res = await api.post('/doctors/profile', data)

    return res.data
}
