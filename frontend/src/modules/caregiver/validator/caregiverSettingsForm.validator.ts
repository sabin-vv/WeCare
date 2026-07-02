import { z } from 'zod'

import { emailSchema, nameSchema, phoneSchema } from '@/shared/validators/common.schema'

export const caregiverSettingsFormSchema = z.object({
    fullName: nameSchema,
    email: emailSchema,
    phoneNumber: phoneSchema,
})
