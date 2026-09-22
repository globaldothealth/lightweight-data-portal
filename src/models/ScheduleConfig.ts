export interface ScheduleConfig {
    id: string;
    scheduleExpression: string;
    outbreakName: string;
    enabled: boolean;
    createdAt?: string;
    updatedAt?: string;
}

