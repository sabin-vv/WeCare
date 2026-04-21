import type { GetDoctorsParams, Specialist } from '../types/patient.types'

import { api } from '@/services/api'

export type GetDoctorsResponse = {
    data: Specialist[]
    specialties: string[]
}

export const getDoctors = async (params: GetDoctorsParams): Promise<GetDoctorsResponse> => {
    const searchParams = new URLSearchParams()
    if (params.search) searchParams.append('search', params.search)
    if (params.specialty) searchParams.append('specialty', params.specialty)
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())

    const response = await api.get<GetDoctorsResponse>(`/doctors?${searchParams.toString()}`)
    return response.data
}
