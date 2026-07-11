import { VIDEO_CALL_ENDPOINTS } from './videoCall.endpoints'

import { api } from '@/services/api'

export interface CreateRoomResponse {
    roomName: string
    token: string
    appointmentID: string
}

export interface TokenResponse {
    token: string
}

export const createRoom = async (appointmentId: string): Promise<CreateRoomResponse> => {
    const res = await api.post<{ success: boolean; data: CreateRoomResponse }>(VIDEO_CALL_ENDPOINTS.ROOM, {
        appointmentId,
    })
    return res.data.data
}

export const getToken = async (roomName: string): Promise<TokenResponse> => {
    const res = await api.get<{ success: boolean; data: TokenResponse }>(VIDEO_CALL_ENDPOINTS.TOKEN(roomName))
    return res.data.data
}

export const getRoomByAppointment = async (appointmentId: string): Promise<CreateRoomResponse> => {
    const res = await api.get<{ success: boolean; data: CreateRoomResponse }>(
        VIDEO_CALL_ENDPOINTS.ROOM_BY_APPOINTMENT(appointmentId),
    )
    return res.data.data
}

export const endRoom = async (roomName: string): Promise<void> => {
    await api.post(VIDEO_CALL_ENDPOINTS.ROOM_END(roomName))
}

export const completeRoom = async (roomName: string): Promise<void> => {
    await api.post(VIDEO_CALL_ENDPOINTS.ROOM_COMPLETE(roomName))
}
