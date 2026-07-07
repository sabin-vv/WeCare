import { Types } from 'mongoose'
import { injectable } from 'tsyringe'

import { IChatRepository } from '../interfaces/chat.repository.interface'
import { ConversationModel, MessageModel } from '../models/chat.model'
import { ConversationDocument, MessageDocument } from '../types/chat.types'

@injectable()
export class ChatRepository implements IChatRepository {
    async findConversationByPatient(patientId: Types.ObjectId): Promise<ConversationDocument | null> {
        return ConversationModel.findOne({ patientId })
    }

    async findConversationsByUserId(
        userId: Types.ObjectId,
        role: 'doctor' | 'caregiver',
    ): Promise<ConversationDocument[]> {
        const field = role === 'doctor' ? 'doctorId' : 'caregiverId'
        return ConversationModel.find({ [field]: userId })
            .sort({ lastMessageAt: -1 })
            .lean()
    }

    async createConversation(data: Partial<ConversationDocument>): Promise<ConversationDocument> {
        return ConversationModel.create(data)
    }

    async updateConversation(
        conversationId: Types.ObjectId,
        data: Partial<ConversationDocument>,
    ): Promise<ConversationDocument | null> {
        return ConversationModel.findByIdAndUpdate(conversationId, { $set: data }, { returnDocument: 'after' })
    }

    async updateUnreadCount(
        conversationId: Types.ObjectId,
        role: 'doctor' | 'caregiver',
        delta: number,
    ): Promise<void> {
        await ConversationModel.findByIdAndUpdate(conversationId, {
            $inc: { [`unreadCount.${role}`]: delta },
        })
    }

    async resetUnreadCount(conversationId: Types.ObjectId, role: 'doctor' | 'caregiver'): Promise<void> {
        await ConversationModel.findByIdAndUpdate(conversationId, {
            $set: { [`unreadCount.${role}`]: 0 },
        })
    }

    async createMessage(data: Partial<MessageDocument>): Promise<MessageDocument> {
        return MessageModel.create(data)
    }

    async findMessagesByConversation(
        conversationId: Types.ObjectId,
        page: number,
        limit: number,
    ): Promise<{ messages: MessageDocument[]; totalCount: number }> {
        const skip = (page - 1) * limit
        const [messages, totalCount] = await Promise.all([
            MessageModel.find({ conversationId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            MessageModel.countDocuments({ conversationId }),
        ])
        return { messages, totalCount }
    }

    async getTotalUnreadCount(
        userId: Types.ObjectId,
        role: 'doctor' | 'caregiver',
    ): Promise<number> {
        const field = role === 'doctor' ? 'doctorId' : 'caregiverId'
        const result = await ConversationModel.aggregate([
            { $match: { [field]: userId } },
            { $group: { _id: null, total: { $sum: `$unreadCount.${role}` } } },
        ])
        return result.length > 0 ? result[0].total : 0
    }

    async markMessageAsRead(messageId: Types.ObjectId): Promise<void> {
        await MessageModel.findByIdAndUpdate(messageId, { $set: { readAt: new Date() } })
    }

    async markConversationMessagesAsRead(
        conversationId: Types.ObjectId,
        receiverId: Types.ObjectId,
    ): Promise<void> {
        await MessageModel.updateMany(
            { conversationId, receiverId, readAt: null },
            { $set: { readAt: new Date() } },
        )
    }
}
