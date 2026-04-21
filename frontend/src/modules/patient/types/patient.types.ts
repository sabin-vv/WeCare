export interface Specialist {
    id: string
    name: string
    specialty: string
    accent: string
    initials: string
    profileImage?: string
}

export interface GetDoctorsParams {
    search?: string
    specialty?: string
    page?: number
    limit?: number
}
