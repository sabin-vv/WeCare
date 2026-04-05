import { z } from 'zod'

export const platformSettingsSchema = z.object({
    platformName: z.string().min(3, 'Platform name must be at least 3 characters'),
    contactEmail: z.string().email('Invalid email address'),
    address: z.string().min(5, 'Address is too short'),
    platformFee: z.number().min(0, 'Fee cannot be negative'),
})

export type PlatformSettingsForm = z.infer<typeof platformSettingsSchema>
