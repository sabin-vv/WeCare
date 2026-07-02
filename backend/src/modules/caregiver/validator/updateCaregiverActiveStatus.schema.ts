import { z } from 'zod'

export const UpdateCaregiverActiveStatusSchema = z.object({
    isActive: z.boolean(),
})

export type UpdateCaregiverActiveStatusDTO = z.infer<typeof UpdateCaregiverActiveStatusSchema>
