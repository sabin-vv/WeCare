import { z } from 'zod'

import { emailschema, mobileSchema, nameSchema } from '../../../core/validation/common.schema'

export const UpdatePatientSettingsSchema = z.object({
    name: nameSchema.optional(),
    mobile: mobileSchema.optional(),
    email: emailschema.optional(),
    profileImage: z.string().optional(),
})

export type UpdatePatientSettingsDTO = z.infer<typeof UpdatePatientSettingsSchema>
