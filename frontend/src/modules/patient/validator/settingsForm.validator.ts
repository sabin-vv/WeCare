import { z } from 'zod'

import { emailSchema, nameSchema, phoneSchema } from '@/shared/validators/common.schema'

export const patientSettingsFormSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    mobile: phoneSchema,
    dateOfBirth: z.string(),
    gender: z.string(),
})
