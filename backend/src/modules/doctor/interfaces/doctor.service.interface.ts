import {
    DailyAppointmentStat,
    DashboardStats,
    DoctorAvailability,
    DoctorProfileResponse,
    DoctorSearchResponse,
    DoctorSlotsResponse,
    UpdateDoctorAvailabilityResult,
} from '../types/doctor.types'
import { DoctorDTO } from '../validator/registerDoctor.schema'
import { UpdateDoctorActiveStatusDTO } from '../validator/updateDoctorActiveStatus.schema'
import { UpdateDoctorAvailabilityDTO } from '../validator/updateDoctorAvailability.schema'
import { UpdateDoctorSettingsDTO } from '../validator/updateDoctorSettings.schema'

export interface IDoctorService {
    createProfile(userId: string, dto: DoctorDTO): Promise<void>
    getProfile(userId: string): Promise<DoctorProfileResponse>
    updateProfile(userId: string, dto: UpdateDoctorSettingsDTO): Promise<DoctorProfileResponse>
    updateActiveStatus(userId: string, dto: UpdateDoctorActiveStatusDTO): Promise<DoctorProfileResponse>
    getAvailability(userId: string): Promise<DoctorAvailability>
    updateAvailability(userId: string, dto: UpdateDoctorAvailabilityDTO): Promise<UpdateDoctorAvailabilityResult>
    searchDoctors(params: {
        search?: string
        specialty?: string
        page: number
        limit: number
        sortBy?: 'rating' | 'name' | 'newest'
        sortOrder?: 'asc' | 'desc'
    }): Promise<DoctorSearchResponse>
    getSpecialties(): Promise<string[]>
    getDoctorById(doctorId: string): Promise<DoctorProfileResponse>
    getDoctorSlots(doctorId: string, date: string): Promise<DoctorSlotsResponse>
    getDashboardStats(userId: string): Promise<DashboardStats>
    getAppointmentStats(
        userId: string,
        startDate: string,
        endDate: string,
    ): Promise<{ dailyStats: DailyAppointmentStat[] }>
}
