import { model, Schema, Types } from 'mongoose'

import { VideoRoomDocument } from '../types/videoCall.types'

const videoRoomSchema = new Schema<VideoRoomDocument>(
    {
        appointmentId: {
            type: Types.ObjectId,
            ref: 'Appointment',
            required: true,
            unique: true,
        },
        roomName: {
            type: String,
            required: true,
            unique: true,
        },
        doctorId: {
            type: Types.ObjectId,
            ref: 'User',
            required: true,
        },
        patientId: {
            type: Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['waiting', 'active', 'ended'],
            default: 'waiting',
        },
        startedAt: {
            type: Date,
        },
        endedAt: {
            type: Date,
        },
        duration: {
            type: Number,
        },
    },
    { timestamps: true },
)

export const VideoRoomModel = model<VideoRoomDocument>('VideoRoom', videoRoomSchema)
