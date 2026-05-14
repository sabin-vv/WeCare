import { Types } from 'mongoose'
import { inject, injectable } from 'tsyringe'

import { TOKENS } from '../../../container/tokens'
import { IUserRepository } from '../../auth/interfaces/user.repository.interface'
import { ICaregiverRepository } from '../../caregiver/interfaces/caregiver.repository.interface'
import { IPatientRepository } from '../../patient/interfaces/patient.repository.interface'
import { ISubscriptionRepository } from '../interfaces/subscription.repository.interface'
import { ISubscriptionService } from '../interfaces/subscription.service.interface'
import { toSubscriptionDTO } from '../mapper/subscription.mapper'
import type { SubscriptionDTO } from '../types/subscription.types'

@injectable()
export class SubscriptionService implements ISubscriptionService {
    constructor(
        @inject(TOKENS.ISubscriptionRepository) private _subscriptionRepo: ISubscriptionRepository,
        @inject(TOKENS.IPatientRepository) private _patientRepo: IPatientRepository,
        @inject(TOKENS.ICaregiverRepository) private _caregiverRepo: ICaregiverRepository,
        @inject(TOKENS.IUserRepository) private _userRepo: IUserRepository,
    ) {}

    async getMySubscription(userId: string): Promise<SubscriptionDTO | null> {
        const patient = await this._patientRepo.findByUserId(new Types.ObjectId(userId))
        if (!patient) {
            return null
        }

        const subscription = await this._subscriptionRepo.findActiveByPatient(patient._id)

        if (!subscription) {
            return null
        }

        const caregiver = await this._caregiverRepo.findById(subscription.caregiverId.toString())
        const caregiverUser = caregiver ? await this._userRepo.findById(caregiver.userId.toString()) : null

        return toSubscriptionDTO(subscription, caregiver ?? undefined, caregiverUser ?? undefined)
    }
}
