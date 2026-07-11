import { VIDEO_CALL_API } from '@/shared/constants/api.constants'

export const VIDEO_CALL_ENDPOINTS = {
    ROOM: `${VIDEO_CALL_API}/room`,
    ROOM_BY_APPOINTMENT: (appointmentId: string) => `${VIDEO_CALL_API}/room/appointment/${appointmentId}`,
    TOKEN: (roomName: string) => `${VIDEO_CALL_API}/token/${roomName}`,
    ROOM_END: (roomName: string) => `${VIDEO_CALL_API}/room/${roomName}/end`,
    ROOM_COMPLETE: (roomName: string) => `${VIDEO_CALL_API}/room/${roomName}/complete`,
} as const
