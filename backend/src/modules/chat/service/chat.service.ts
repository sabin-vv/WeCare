import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { getIO } from '../../../core/socket'
import { EVENTS } from '../../../core/socket/events'
import { IUserRepository } from '../../auth/interfaces/user.repository.interface'
import { ICaregiverRepository } from '../../caregiver/interfaces/caregiver.repository.interface'
import { IDoctorRepository } from '../../doctor/interfaces/doctor.repository.interface'
import { IPatientRepository } from '../../patient/interfaces/patient.repository.interface'
import { MSG } from '../constants/messages'
import { IChatRepository } from '../interfaces/chat.repository.interface'
import { IChatService } from '../interfaces/chat.service.interface'
import {
    ConversationDTO,
    ConversationListResponse,
    MessageDTO,
    MessagesResponse,
    SendMessageResponse,
} from '../types/chat.types'

@injectable()
export class ChatService implements IChatService {
    constructor(
        @inject(TOKENS.IChatRepository) private _chatRepo: IChatRepository,
        @inject(TOKENS.IPatientRepository) private _patientRepo: IPatientRepository,
        @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
        @inject(TOKENS.IDoctorRepository) private _doctorRepo: IDoctorRepository,
        @inject(TOKENS.ICaregiverRepository) private _caregiverRepo: ICaregiverRepository,
    ) {}

    async getConversations(
        userId: string,
        role: 'doctor' | 'caregiver',
    ): Promise<ConversationListResponse> {
        const conversations = await this._chatRepo.findConversationsByUserId(
            new Types.ObjectId(userId),
            role,
        )

        const conversationDTOs: ConversationDTO[] = await Promise.all(
            conversations.map(async (conv) => {
                const patient = await this._patientRepo.findById(conv.patientId.toString())
                let patientName = 'Unknown Patient'
                if (patient) {
                    const user = await this._userRepo.findById(patient.userId.toString())
                    if (user) patientName = user.name
                }

                const otherId =
                    role === 'doctor' ? conv.caregiverId.toString() : conv.doctorId.toString()
                let otherUser = await this._userRepo.findById(otherId)

                let otherProfileImage: string | undefined

                if (!otherUser) {
                    const otherDoc =
                        role === 'doctor'
                            ? await this._caregiverRepo.findById(otherId)
                            : await this._doctorRepo.findById(otherId)
                    if (otherDoc) {
                        otherUser = await this._userRepo.findById(otherDoc.userId.toString())
                        otherProfileImage = otherDoc.profileImage
                    }
                } else {
                    const otherDoc =
                        role === 'doctor'
                            ? await this._caregiverRepo.findByUserId(new Types.ObjectId(otherId))
                            : await this._doctorRepo.findByUserId(new Types.ObjectId(otherId))
                    otherProfileImage = otherDoc?.profileImage
                }

                const otherPersonName =
                    role === 'doctor'
                        ? otherUser?.name ?? 'Caregiver'
                        : otherUser
                          ? `Dr. ${otherUser.name}`
                          : 'Doctor'

                return {
                    patientId: conv.patientId.toString(),
                    patientName,
                    patientProfileImage: patient?.profileImage,
                    otherPersonName,
                    otherPersonProfileImage: otherProfileImage,
                    otherPersonRole: role === 'doctor' ? 'caregiver' : 'doctor',
                    lastMessage: conv.lastMessage,
                    lastMessageAt: conv.lastMessageAt?.toISOString() ?? '',
                    lastSenderId: conv.lastSenderId?.toString() ?? '',
                    lastSenderRole: conv.lastSenderRole ?? 'doctor',
                    unreadCount: conv.unreadCount[role],
                }
            }),
        )

        return { conversations: conversationDTOs }
    }

    async getTotalUnreadCount(
        userId: string,
        role: 'doctor' | 'caregiver',
    ): Promise<{ unreadCount: number }> {
        const total = await this._chatRepo.getTotalUnreadCount(new Types.ObjectId(userId), role)
        return { unreadCount: total }
    }

    async getMessages(
        userId: string,
        role: 'doctor' | 'caregiver',
        patientId: string,
        page: number,
        limit: number,
    ): Promise<MessagesResponse> {
        const conversation = await this._ensureConversation(userId, role, patientId)

        const { messages, totalCount } = await this._chatRepo.findMessagesByConversation(
            conversation._id,
            page,
            limit,
        )

        await this._chatRepo.resetUnreadCount(conversation._id, role)

        await this._chatRepo.markConversationMessagesAsRead(
            conversation._id,
            new Types.ObjectId(userId),
        )

        const messageDTOs: MessageDTO[] = messages.map((msg) => ({
            id: msg._id.toString(),
            conversationId: msg.conversationId.toString(),
            senderId: msg.senderId.toString(),
            senderRole: msg.senderRole,
            message: msg.message,
            readAt: msg.readAt?.toISOString() ?? null,
            createdAt: msg.createdAt?.toISOString() ?? '',
        }))

        return {
            messages: messageDTOs,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
            },
        }
    }

    async sendMessage(
        userId: string,
        role: 'doctor' | 'caregiver',
        patientId: string,
        message: string,
    ): Promise<SendMessageResponse> {
        const conversation = await this._ensureConversation(userId, role, patientId)

        const otherRole = role === 'doctor' ? 'caregiver' : 'doctor'
        const otherIdField = role === 'doctor' ? 'caregiverId' : 'doctorId'
        const receiverId = conversation[otherIdField as keyof typeof conversation] as Types.ObjectId

        const msgDoc = await this._chatRepo.createMessage({
            conversationId: conversation._id,
            patientId: conversation.patientId,
            senderId: new Types.ObjectId(userId),
            senderRole: role,
            receiverId,
            receiverRole: otherRole,
            message,
        })

        await this._chatRepo.updateConversation(conversation._id, {
            lastMessage: message,
            lastMessageAt: new Date(),
            lastSenderId: new Types.ObjectId(userId),
            lastSenderRole: role,
        })

        await this._chatRepo.updateUnreadCount(conversation._id, otherRole, 1)

        const msgDTO: MessageDTO = {
            id: msgDoc._id.toString(),
            conversationId: msgDoc.conversationId.toString(),
            senderId: msgDoc.senderId.toString(),
            senderRole: msgDoc.senderRole,
            message: msgDoc.message,
            readAt: null,
            createdAt: msgDoc.createdAt?.toISOString() ?? '',
        }

        const io = getIO()
        const senderRoom = `user:${userId}`
        const receiverRoom = `user:${receiverId.toString()}`
        io.to(receiverRoom).emit(EVENTS.NEW_CHAT_MESSAGE, {
            conversation: {
                patientId: conversation.patientId.toString(),
                lastMessage: message,
                lastMessageAt: msgDTO.createdAt,
                lastSenderId: userId,
                lastSenderRole: role,
                unreadCount: (await this._chatRepo.findConversationByPatient(conversation.patientId))
                    ?.unreadCount[otherRole],
            },
            message: msgDTO,
        })
        io.to(senderRoom).emit(EVENTS.CHAT_MESSAGE_SENT, msgDTO)

        return { message: msgDTO }
    }

    async markAsRead(userId: string, role: 'doctor' | 'caregiver', messageId: string): Promise<void> {
        await this._chatRepo.markMessageAsRead(new Types.ObjectId(messageId))
    }

    private async _ensureConversation(
        userId: string,
        role: 'doctor' | 'caregiver',
        patientId: string,
    ) {
        const patientObjectId = new Types.ObjectId(patientId)
        const currentUserId = new Types.ObjectId(userId)
        const patient = await this._patientRepo.findById(patientId)
        if (!patient) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.PATIENT_NOT_FOUND)
        }

        if (!patient.primaryDoctorId) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Patient has no assigned doctor')
        }

        if (!patient.caregiverId) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Patient has no assigned caregiver')
        }

        const [doctor, caregiver] = await Promise.all([
            this._doctorRepo.findById(patient.primaryDoctorId.toString()),
            this._caregiverRepo.findById(patient.caregiverId.toString()),
        ])

        if (!doctor?.userId) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Assigned doctor profile is invalid')
        }

        if (!caregiver?.userId) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Assigned caregiver profile is invalid')
        }

        const doctorUserId = new Types.ObjectId(doctor.userId)
        const caregiverUserId = new Types.ObjectId(caregiver.userId)
        const expectedUserId = role === 'doctor' ? doctorUserId : caregiverUserId

        if (!expectedUserId.equals(currentUserId)) {
            throw new AppError(HTTP_STATUS.FORBIDDEN, 'You are not assigned to this patient')
        }

        let conversation = await this._chatRepo.findConversationByPatient(patientObjectId)

        if (!conversation) {
            conversation = await this._chatRepo.createConversation({
                patientId: patientObjectId,
                doctorId: doctorUserId,
                caregiverId: caregiverUserId,
                unreadCount: { doctor: 0, caregiver: 0 },
            })
        } else if (!conversation.doctorId.equals(doctorUserId) || !conversation.caregiverId.equals(caregiverUserId)) {
            const normalizedConversation = await this._chatRepo.updateConversation(conversation._id, {
                doctorId: doctorUserId,
                caregiverId: caregiverUserId,
            })

            if (!normalizedConversation) {
                throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.CONVERSATION_NOT_FOUND)
            }

            conversation = normalizedConversation
        }

        return conversation
    }
}
