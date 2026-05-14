import { Types } from 'mongoose'

import { MulterFiles, UserDocument } from '../../auth/types/auth.types'
import { CaregiverDocument, CaregiverEntity, CaregiverProfileResponse, CaregiverWithUser } from '../types/caregiver.types'
import { CreateCaregiverProfileDTO } from '../validator/caregiver.schema'

export const toCaregiverEntity = (
    userId: Types.ObjectId,
    dto: CreateCaregiverProfileDTO,
    files: MulterFiles,
): CaregiverEntity => {
    const fromDtoOrFile = (dtoValue: string | undefined, fileField: string) => {
        return dtoValue ?? files?.[fileField]?.[0]?.originalname ?? ''
    }

    return {
        userId,
        certificateNumber: dto.certificateNumber,
        licenseNumber: dto.licenseNumber,

        govIdImage: fromDtoOrFile(dto.govIdImage, 'govIdImage'),
        profileImage: fromDtoOrFile(dto.profileImage, 'profileImage'),
        certificateImage: fromDtoOrFile(dto.certificateImage, 'certificateImage'),
        licenseImage: fromDtoOrFile(dto.licenseImage, 'licenseImage'),
    }
}

export const toCaregiverProfileResponse = (
    user: UserDocument,
    caregiver: CaregiverDocument,
): CaregiverProfileResponse => {
    return {
        id: user._id.toString(),
        fullName: user.name,
        email: user.email,
        phoneNumber: user.mobile,
        profileImage: caregiver.profileImage,
        govIdImage: caregiver.govIdImage,
        certificateNumber: caregiver.certificateNumber,
        certificateImage: caregiver.certificateImage,
        licenseNumber: caregiver.licenseNumber,
        licenseImage: caregiver.licenseImage,
        isActive: caregiver.isActive,
        verificationStatus: caregiver.verificationStatus,
        rejectReason: caregiver.rejectReason,
    }
}
export const toCaregiverProfileEntity = (profile: Partial<CaregiverDocument>) => {
    return {
        govIdImage: profile.govIdImage,
        profileImage: profile.profileImage,
        certificateNumber: profile.certificateNumber,
        certificateImage: profile.certificateImage,
        licenseNumber: profile.licenseNumber,
        licenseImage: profile.licenseImage,
    }
}

export const toCaregiverProfileResponseFromAggregation = (caregiver: CaregiverWithUser): CaregiverProfileResponse => {
    return {
        id: caregiver._id.toString(),
        fullName: caregiver.user?.name || 'Unnamed Caregiver',
        email: caregiver.user?.email || '',
        phoneNumber: caregiver.user?.mobile || '',
        profileImage: caregiver.profileImage,
        govIdImage: caregiver.govIdImage,
        certificateNumber: caregiver.certificateNumber,
        certificateImage: caregiver.certificateImage,
        licenseNumber: caregiver.licenseNumber,
        licenseImage: caregiver.licenseImage,
        isActive: caregiver.isActive,
        verificationStatus: caregiver.verificationStatus,
        rejectReason: caregiver.rejectReason,
    }
}
