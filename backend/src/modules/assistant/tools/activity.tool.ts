import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { IActivityLogRepository } from '../../activityLog/interfaces/activityLog.repository.interface'

@injectable()
export class ActivityTool {
    constructor(
        @inject(TOKENS.IActivityLogRepository) private readonly _activityLogRepo: IActivityLogRepository,
    ) {}

    async getRecentActivity(userId: string): Promise<string | null> {
        const result = await this._activityLogRepo.findAllPaginated(
            { performedBy: new Types.ObjectId(userId) },
            1,
            5,
        )

        if (!result.data.length) return null

        return result.data
            .map((a) => `- ${a.action} | ${a.description}${a.createdAt ? ` (${new Date(a.createdAt).toLocaleDateString()})` : ''}`)
            .join('\n')
    }

    async getContext(userId: string): Promise<string | null> {
        return this.getRecentActivity(userId)
    }
}
