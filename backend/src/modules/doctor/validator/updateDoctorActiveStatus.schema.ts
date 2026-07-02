import { z } from 'zod'

export const UpdateDoctorActiveStatusSchema = z.object({
    isActive: z.boolean(),
})

export type UpdateDoctorActiveStatusDTO = z.infer<typeof UpdateDoctorActiveStatusSchema>
