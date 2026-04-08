import { z } from 'zod'

export const DoctorSchema = z.object({
    medicalCertificateNumber: z.string().min(1, 'Medical certificate number is required'),
    medicalCouncilRegisterNumber: z.string().min(1, 'Medical council register number required'),

    govIdImage: z.string().min(1, 'Government ID is required'),
    profileImage: z.string().min(1, 'Profile image is required'),
    medicalCertificateImage: z.string().min(1, 'Medical certificate image is required'),
    medicalCouncilImage: z.string().min(1, 'Medical council document is required'),

    specializationDocumentKeys: z
        .string()
        .transform((val) => JSON.parse(val))
        .pipe(
            z
                .array(z.string().min(1, 'Document key is required'))
                .min(1, 'At least one specialization document is required'),
        ),
    specializations: z
        .string()
        .transform((val) => JSON.parse(val))
        .pipe(
            z
                .array(
                    z.object({
                        name: z.string().min(1, 'Specialization name is required'),
                    }),
                )
                .min(1, 'At least one specialization is required'),
        ),
})

export type DoctorDTO = z.infer<typeof DoctorSchema>
