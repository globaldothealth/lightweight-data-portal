export interface ScheduleConfig {
    id: string;
    name: string;
    description?: string | null;
    scheduleExpression: string;
    targetFileKey: string;
    enabled: boolean;
    createdAt?: string;
    updatedAt?: string;
}

