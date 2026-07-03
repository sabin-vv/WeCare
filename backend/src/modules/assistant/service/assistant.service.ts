import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { env } from '../../../core/config/env'
import { HTTP_STATUS } from '../../../core/constants/httpStatus'
import { AppError } from '../../../core/errors/AppError'
import { MSG } from '../constants/messages'
import { IAssistantService } from '../interfaces/assistant.service.interface'
import { SYSTEM_PROMPT } from '../prompts/system.prompt'
import { ActivityTool } from '../tools/activity.tool'
import { AlertTool } from '../tools/alert.tool'
import { AppointmentTool } from '../tools/appointment.tool'
import { MedicalRecordTool } from '../tools/medicalRecord.tool'
import { MedicationTool } from '../tools/medication.tool'
import { PatientTool } from '../tools/patient.tool'
import { PrescriptionTool } from '../tools/prescription.tool'
import { SubscriptionTool } from '../tools/subscription.tool'
import { SymptomTool } from '../tools/symptom.tool'
import { VitalTool } from '../tools/vital.tool'
import { WalletTool } from '../tools/wallet.tool'
import type { AssistantChatRequest, AssistantChatResponse } from '../types/assistant.types'

const GEMINI_MODEL = env.GEMINI_MODEL
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

interface ITool {
    getContext(userId: string): Promise<string | null>
}

@injectable()
export class AssistantService implements IAssistantService {
    private readonly _tools: ITool[]

    constructor(
        @inject(TOKENS.IAppointmentTool) private readonly _appointmentTool: AppointmentTool,
        @inject(TOKENS.IMedicationTool) private readonly _medicationTool: MedicationTool,
        @inject(TOKENS.IWalletTool) private readonly _walletTool: WalletTool,
        @inject(TOKENS.ISubscriptionTool) private readonly _subscriptionTool: SubscriptionTool,
        @inject(TOKENS.IPatientTool) private readonly _patientTool: PatientTool,
        @inject(TOKENS.IPrescriptionTool) private readonly _prescriptionTool: PrescriptionTool,
        @inject(TOKENS.IMedicalRecordTool) private readonly _medicalRecordTool: MedicalRecordTool,
        @inject(TOKENS.IVitalTool) private readonly _vitalTool: VitalTool,
        @inject(TOKENS.ISymptomTool) private readonly _symptomTool: SymptomTool,
        @inject(TOKENS.IAlertTool) private readonly _alertTool: AlertTool,
        @inject(TOKENS.IActivityTool) private readonly _activityTool: ActivityTool,
    ) {
        this._tools = [
            this._appointmentTool,
            this._medicationTool,
            this._walletTool,
            this._subscriptionTool,
            this._patientTool,
            this._prescriptionTool,
            this._medicalRecordTool,
            this._vitalTool,
            this._symptomTool,
            this._alertTool,
            this._activityTool,
        ]
    }

    async chat({ userId, message }: AssistantChatRequest): Promise<AssistantChatResponse> {
        if (!env.GEMINI_API_KEY) {
            throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, MSG.GEMINI_API_KEY_NOT_CONFIGURED)
        }

        const contextParts = await this._buildContext(userId)

        const systemInstruction = contextParts
            ? `${SYSTEM_PROMPT}\n\n====================================\nPATIENT CONTEXT (real-time)\n====================================\n\n${contextParts}`
            : SYSTEM_PROMPT

        const payload = {
            contents: [{ role: 'user', parts: [{ text: message }] }],
            systemInstruction: {
                parts: [{ text: systemInstruction }],
            },
            generationConfig: {
                maxOutputTokens: 512,
                temperature: 0.7,
            },
        }

        const url = `${GEMINI_API_URL}?key=${env.GEMINI_API_KEY}`

        const controller = new AbortController()

        const timeout = setTimeout(() => {
            controller.abort()
        }, 10000)

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
        })

        clearTimeout(timeout)

        if (!response.ok) {
            const errorText = await response.text()
            this._handleGeminiError(response.status, errorText)
        }

        const data = await response.json()
        const content = data?.candidates?.[0]?.content?.parts?.[0]?.text

        if (!content || typeof content !== 'string') {
            throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, MSG.INVALID_GEMINI_RESPONSE)
        }

        return { text: content.trim() }
    }

    private async _buildContext(userId: string): Promise<string | null> {
        const results = await Promise.allSettled(this._tools.map((tool) => tool.getContext(userId)))

        const sections: string[] = []
        const labels = [
            'Upcoming Appointments',
            'Current Medications',
            'Wallet',
            'Subscription',
            'Profile',
            'Active Prescriptions',
            'Medical Record',
            'Latest Vitals',
            'Recent Symptoms',
            'Active Alerts',
            'Recent Activity',
        ]

        for (let i = 0; i < results.length; i++) {
            const result = results[i]
            if (result.status === 'fulfilled' && result.value !== null) {
                sections.push(`${labels[i]}:\n${result.value}`)
            }
        }

        return sections.length ? sections.join('\n\n') : null
    }

    private _handleGeminiError(status: number, message?: string): never {
        switch (status) {
            case 400:
                throw new AppError(HTTP_STATUS.BAD_REQUEST, MSG.INVALID_AI_REQUEST)
            case 401:
                throw new AppError(HTTP_STATUS.UNAUTHORIZED, MSG.INVALID_AI_API_KEY)
            case 403:
                throw new AppError(HTTP_STATUS.FORBIDDEN, MSG.ACCESS_DENIED)
            case 404:
                throw new AppError(HTTP_STATUS.NOT_FOUND, MSG.AI_MODEL_NOT_FOUND)
            case 429:
                throw new AppError(HTTP_STATUS.TOO_MANY_REQUESTS, MSG.TOO_MANY_REQUESTS)

            case 500:
            case 502:
            case 503:
                throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, MSG.AI_SERVER_UNAVAILABLE)
            default:
                throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, message ?? MSG.UNEXPECTED_AI_ERROR)
        }
    }
}
