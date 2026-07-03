import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { IAlertService } from '../../alert/interfaces/alert.service.interface'

@injectable()
export class AlertTool {
    constructor(@inject(TOKENS.IAlertService) private readonly _alertService: IAlertService) {}

    async getActiveAlerts(userId: string): Promise<string | null> {
        const result = await this._alertService.getAlerts(userId, 'patient', {
            status: 'active',
            limit: 5,
        })

        if (!result.alerts.length) return null

        return result.alerts
            .map((a) => `- [${a.severity}] ${a.type}: ${a.triggerReason}${a.triggeredAt ? ` (${new Date(a.triggeredAt).toLocaleDateString()})` : ''}`)
            .join('\n')
    }

    async getContext(userId: string): Promise<string | null> {
        return this.getActiveAlerts(userId)
    }
}
