import { z } from 'zod'

import { emailschema, mobileSchema, nameSchema } from '../../../core/validation/common.schema'

export const UpdateCaregiverSettingsSchema = z.object({
    fullName: nameSchema.optional(),
    phoneNumber: mobileSchema.optional(),
    email: emailschema.optional(),
    isActive: z.coerce.boolean().optional(),
    profileImage: z.string().optional(),
    govIdImage: z.string().min(1, 'Government ID is required').optional(),
    certificateNumber: z.string().min(1, 'Certificate number is required').optional(),
    certificateImage: z.string().min(1, 'Certificate document is required').optional(),
    licenseNumber: z.string().min(1, 'License number is required').optional(),
    licenseImage: z.string().min(1, 'License document is required').optional(),
})

export type UpdateCaregiverSettingsDTO = z.infer<typeof UpdateCaregiverSettingsSchema>
