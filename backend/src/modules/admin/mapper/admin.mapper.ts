import {
    AdminUserProfile,
    PendingCaregiver,
    PendingDoctor,
    PlatformSettings,
    RecentCaregiver,
    RecentDoctor,
} from '../types/admin.types'

export const toPendingDoctorDTO = (doctor: PendingDoctor): PendingDoctor => {
    return {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        profileImage: doctor.profileImage || '',
        medicalCouncilRegisterNumber: doctor.medicalCouncilRegisterNumber || '',
        medicalCertificateNumber: doctor.medicalCertificateNumber || '',
        medicalCouncilImage: doctor.medicalCouncilImage || '',
        medicalCertificateImage: doctor.medicalCertificateImage || '',
        govIdImage: doctor.govIdImage || '',
        specializations: doctor.specializations || [],
        createdAt: doctor.createdAt,
        verificationStatus: doctor.verificationStatus,
    }
}

export const toRecentDoctorDTO = (doctor: RecentDoctor): RecentDoctor => {
    return {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        profileImage: doctor.profileImage || '',
        medicalCouncilRegisterNumber: doctor.medicalCouncilRegisterNumber || '',
        medicalCertificateNumber: doctor.medicalCertificateNumber || '',
        medicalCouncilImage: doctor.medicalCouncilImage || '',
        medicalCertificateImage: doctor.medicalCertificateImage || '',
        govIdImage: doctor.govIdImage || '',
        specializations: doctor.specializations || [],
        createdAt: doctor.createdAt,
        updatedAt: doctor.updatedAt,
        verificationStatus: doctor.verificationStatus,
        rejectReason: doctor.rejectReason || '',
    }
}

export const toPendingCaregiverDTO = (caregiver: PendingCaregiver): PendingCaregiver => {
    return {
        _id: caregiver._id,
        name: caregiver.name,
        email: caregiver.email,
        profileImage: caregiver.profileImage || '',
        certificateNumber: caregiver.certificateNumber || '',
        licenseNumber: caregiver.licenseNumber || '',
        certificateImage: caregiver.certificateImage || '',
        licenseImage: caregiver.licenseImage || '',
        govIdImage: caregiver.govIdImage || '',
        createdAt: caregiver.createdAt,
        verificationStatus: caregiver.verificationStatus,
    }
}

export const toRecentCaregiverDTO = (caregiver: RecentCaregiver): RecentCaregiver => {
    return {
        _id: caregiver._id,
        name: caregiver.name,
        email: caregiver.email,
        profileImage: caregiver.profileImage || '',
        certificateNumber: caregiver.certificateNumber || '',
        licenseNumber: caregiver.licenseNumber || '',
        certificateImage: caregiver.certificateImage || '',
        licenseImage: caregiver.licenseImage || '',
        govIdImage: caregiver.govIdImage || '',
        createdAt: caregiver.createdAt,
        updatedAt: caregiver.updatedAt,
        verificationStatus: caregiver.verificationStatus,
    }
}

export const toAdminUserProfileDTO = (user: AdminUserProfile): AdminUserProfile => {
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        profileImage: user.profileImage || '',
    }
}

export const toPlatformSettingsDTO = (settings: PlatformSettings): PlatformSettings => {
    return {
        platformName: settings.platformName || '',
        contactEmail: settings.contactEmail || '',
        address: settings.address || '',
        platformFee: settings.platformFee || 0,
        platformLogo: settings.platformLogo || '',
        platformIcon: settings.platformIcon || '',
    }
}
