import { z } from 'zod'

export const UpdatePatientConditionSchema = z.object({
    conditions: z.array(z.string().trim().min(1, 'Condition is required')).min(1, 'At least one condition is required'),
    riskLevel: z.enum(['mild', 'moderate', 'severe', 'high_risk']),
})

export type UpdatePatientConditionDTO = z.infer<typeof UpdatePatientConditionSchema>
