export enum UserRole {
    DOCTOR = 'doctor',
    CAREGIVER = 'caregiver',
    PATIENT = 'patient',
    ADMIN = 'admin',
}

import { Document, Types } from 'mongoose'
import { UserResponseDTO } from '../mapper/auth.mapper'

export interface UserDocument extends Document {
    name: string
    email: string
    mobile: string
    password: string
    role: UserRole
    isActive: boolean
    isProfileComplete: boolean
}

export type MulterFiles = Record<string, Express.Multer.File[]>

export interface LoginResponse {
    user: UserResponseDTO
    tokens: {
        accessToken: string
        refreshToken: string
    }
}
