import { z } from 'zod'

import { emailschema, mobileSchema, nameSchema } from '../../../core/validation/common.schema'

export const UpdateDoctorSettingsSchema = z.object({
    fullName: nameSchema,
    professionalTitle: z.string().min(1, 'Professional title is required'),
    consultationFee: z.coerce.number().min(0, 'Consultation fee must be zero or greater'),
    phoneNumber: mobileSchema,
    email: emailschema,
    isActive: z.boolean().optional(),
})

export type UpdateDoctorSettingsDTO = z.infer<typeof UpdateDoctorSettingsSchema>
