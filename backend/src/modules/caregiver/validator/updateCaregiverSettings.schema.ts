import { z } from 'zod'

import { emailschema, mobileSchema, nameSchema } from '../../../core/validation/common.schema'

export const UpdateCaregiverSettingsSchema = z.object({
    fullName: nameSchema,
    phoneNumber: mobileSchema,
    email: emailschema,
    isActive: z.boolean().optional(),
})

export type UpdateCaregiverSettingsDTO = z.infer<typeof UpdateCaregiverSettingsSchema>
