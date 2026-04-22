import bcrypt from 'bcrypt'

import { UserDocument, UserRole } from '../types/auth.types'

interface UserRegistrationDTO {
    name: string
    email: string
    mobile: string
    password: string
}

export interface UserResponseDTO {
    id: string
    name: string
    email: string
    role: string
    isProfileComplete: boolean
    profileImage?: string
    specialization?: string
    verificationStatus?: string
}

export interface UserProfile {
    profileImage?: string
    specialization?: string
    verificationStatus?: string
}

export const toUserEntity = async (dto: UserRegistrationDTO, role: UserRole) => {
    return {
        name: dto.name,
        email: dto.email,
        mobile: dto.mobile,
        password: await bcrypt.hash(dto.password, 10),
        role,
    }
}

export const toUserResponseDTO = (user: UserDocument, profile?: UserProfile): UserResponseDTO => {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
        profileImage: profile?.profileImage,
        specialization: profile?.specialization,
        verificationStatus: profile?.verificationStatus,
    }
}
