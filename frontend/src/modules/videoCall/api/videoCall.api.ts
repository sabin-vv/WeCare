import { api } from '@/services/api'
import { VIDEO_CALL_API } from '@/shared/constants/api.constants'

export interface CreateRoomResponse {
    roomName: string
    token: string
    appointmentID: string
}

export interface TokenResponse {
    token: string
}

export const createRoom = async (appointmentId: string): Promise<CreateRoomResponse> => {
    const res = await api.post<{ success: boolean; data: CreateRoomResponse }>(`${VIDEO_CALL_API}/room`, {
        appointmentId,
    })
    return res.data.data
}

export const getToken = async (roomName: string): Promise<TokenResponse> => {
    const res = await api.get<{ success: boolean; data: TokenResponse }>(`${VIDEO_CALL_API}/token/${roomName}`)
    return res.data.data
}

export const getRoomByAppointment = async (appointmentId: string): Promise<CreateRoomResponse> => {
    const res = await api.get<{ success: boolean; data: CreateRoomResponse }>(
        `${VIDEO_CALL_API}/room/appointment/${appointmentId}`,
    )
    return res.data.data
}

export const endRoom = async (roomName: string): Promise<void> => {
    await api.post(`${VIDEO_CALL_API}/room/${roomName}/end`)
}

export const completeRoom = async (roomName: string): Promise<void> => {
    await api.post(`${VIDEO_CALL_API}/room/${roomName}/complete`)
}
