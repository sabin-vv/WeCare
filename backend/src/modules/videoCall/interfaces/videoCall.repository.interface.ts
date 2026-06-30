import { VideoRoomDocument } from '../types/videoCall.types'

export interface IVideoCallRepository {
    create(data: Partial<VideoRoomDocument>): Promise<VideoRoomDocument>
    findByRoomName(roomName: string): Promise<VideoRoomDocument | null>
    findByAppointmentId(appointmentId: string): Promise<VideoRoomDocument | null>
    updateByRoomName(roomName: string, data: Partial<VideoRoomDocument>): Promise<VideoRoomDocument | null>
}
