import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { IVitalService } from '../../vital/interfaces/vital.service.interface'

@injectable()
export class VitalTool {
    constructor(@inject(TOKENS.IVitalService) private readonly _vitalService: IVitalService) {}

    async getLatestVitals(userId: string): Promise<string | null> {
        const schedules = await this._vitalService.getPatientVitalSchedules(userId)
        const recorded = schedules.filter((s) => s.status === 'recorded' && s.recordedValue)

        if (!recorded.length) return null

        const latestByType = new Map<string, (typeof recorded)[0]>()
        for (const s of recorded) {
            if (!latestByType.has(s.vitalType)) {
                latestByType.set(s.vitalType, s)
            }
        }

        return Array.from(latestByType.entries())
            .map(([type, s]) => {
                const val = s.recordedValue
                if (type === 'blood_pressure') {
                    return `${type}: ${val?.systolic}/${val?.diastolic} ${val?.unit || 'mmHg'}`
                }
                return `${type}: ${val?.value} ${val?.unit || ''}`
            })
            .join('\n')
    }

    async getVitalHistory(userId: string): Promise<string | null> {
        const schedules = await this._vitalService.getPatientVitalSchedules(userId)
        const recorded = schedules.filter((s) => s.status === 'recorded').slice(0, 10)

        if (!recorded.length) return null

        return recorded
            .map((s) => {
                const val = s.recordedValue
                const date = s.recordedAt ? new Date(s.recordedAt).toLocaleDateString() : ''
                const time = s.scheduleTime ? new Date(s.scheduleTime).toLocaleTimeString() : ''
                if (s.vitalType === 'blood_pressure') {
                    return `- ${date} ${time} | BP ${val?.systolic}/${val?.diastolic} ${val?.unit || 'mmHg'}`
                }
                return `- ${date} ${time} | ${s.vitalType}: ${val?.value} ${val?.unit || ''}`
            })
            .join('\n')
    }

    async getContext(userId: string): Promise<string | null> {
        return this.getLatestVitals(userId)
    }
}
