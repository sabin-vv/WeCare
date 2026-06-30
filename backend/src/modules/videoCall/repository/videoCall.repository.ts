import { singleton } from 'tsyringe'

import { BaseRepository } from '../../../core/base/base.repository'
import { IVideoCallRepository } from '../interfaces/videoCall.repository.interface'
import { VideoRoomModel } from '../models/videoRoom.model'
import { VideoRoomDocument } from '../types/videoCall.types'

@singleton()
export class VideoCallRepository extends BaseRepository<VideoRoomDocument> implements IVideoCallRepository {
    constructor() {
        super(VideoRoomModel)
    }

    async create(data: Partial<VideoRoomDocument>): Promise<VideoRoomDocument> {
        return await this.model.create(data)
    }

    async findByRoomName(roomName: string): Promise<VideoRoomDocument | null> {
        return await this.model.findOne({ roomName }).lean()
    }

    async findByAppointmentId(appointmentId: string): Promise<VideoRoomDocument | null> {
        return await this.model.findOne({ appointmentId }).lean()
    }

    async updateByRoomName(roomName: string, data: Partial<VideoRoomDocument>): Promise<VideoRoomDocument | null> {
        return await this.model.findOneAndUpdate({ roomName }, data, { returnDocument: 'after' }).lean()
    }
}
