import { model, Schema, Types } from 'mongoose'

import { ConversationDocument, MessageDocument } from '../types/chat.types'

const conversationSchema = new Schema<ConversationDocument>(
    {
        patientId: {
            type: Types.ObjectId,
            ref: 'Patient',
            required: true,
            unique: true,
        },
        doctorId: {
            type: Types.ObjectId,
            ref: 'User',
            required: true,
        },
        caregiverId: {
            type: Types.ObjectId,
            ref: 'User',
            required: true,
        },
        lastMessage: {
            type: String,
            default: '',
        },
        lastMessageAt: Date,
        lastSenderId: {
            type: Types.ObjectId,
            ref: 'User',
        },
        lastSenderRole: {
            type: String,
            enum: ['doctor', 'caregiver'],
        },
        unreadCount: {
            doctor: { type: Number, default: 0 },
            caregiver: { type: Number, default: 0 },
        },
    },
    { timestamps: true },
)

const messageSchema = new Schema<MessageDocument>(
    {
        conversationId: {
            type: Types.ObjectId,
            ref: 'Conversation',
            required: true,
            index: true,
        },
        patientId: {
            type: Types.ObjectId,
            ref: 'Patient',
            required: true,
        },
        senderId: {
            type: Types.ObjectId,
            ref: 'User',
            required: true,
        },
        senderRole: {
            type: String,
            enum: ['doctor', 'caregiver'],
            required: true,
        },
        receiverId: {
            type: Types.ObjectId,
            ref: 'User',
            required: true,
        },
        receiverRole: {
            type: String,
            enum: ['doctor', 'caregiver'],
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        readAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true },
)

messageSchema.index({ conversationId: 1, createdAt: -1 })

export const ConversationModel = model<ConversationDocument>('Conversation', conversationSchema)
export const MessageModel = model<MessageDocument>('Message', messageSchema)
