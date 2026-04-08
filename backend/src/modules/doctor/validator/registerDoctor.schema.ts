import { z } from 'zod'

export const DoctorSchema = z.object({
    medicalCertificateNumber: z.string().min(1, 'Medical certificate number is required'),
    medicalCouncilRegisterNumber: z.string().min(1, 'Medical council register number required'),

    govIdImage: z.string().min(1).optional(),
    profileImage: z.string().min(1).optional(),
    medicalCertificateImage: z.string().min(1).optional(),
    medicalCouncilImage: z.string().min(1).optional(),

    specializationDocumentKeys: z
        .string()
        .transform((val) => JSON.parse(val))
        .pipe(z.array(z.string().min(1).nullable()))
        .optional(),
    specializations: z
        .string()
        .transform((val) => JSON.parse(val))
        .pipe(
            z.array(
                z.object({
                    name: z.string(),
                }),
            ),
        ),
})

export type DoctorDTO = z.infer<typeof DoctorSchema>
