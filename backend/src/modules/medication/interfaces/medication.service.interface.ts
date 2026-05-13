export interface IMedicationService {
    generateDailySchedule(date: Date): Promise<{ created: number; skipped: number }>
}
