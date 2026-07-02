import { z } from 'zod'

import { emailSchema, nameSchema, phoneSchema } from '@/shared/validators/common.schema'

export const settingsFormSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    phoneNumber: phoneSchema,
    consultationFee: z
        .number({ message: 'Fee must be a number' })
        .min(100, 'Consultation fee must be at least ₹100')
        .max(10000, 'Consultation fee cannot exceed ₹10,000'),
})
