import type { DynamoDBStreamHandler, DynamoDBRecord } from 'aws-lambda';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import {
    SchedulerClient,
    CreateScheduleCommand,
    UpdateScheduleCommand,
    DeleteScheduleCommand,
} from '@aws-sdk/client-scheduler';

const scheduler = new SchedulerClient();

const AGGREGATION_FUNCTION_ARN = process.env.AGGREGATION_FUNCTION_ARN as string;
const SCHEDULER_ROLE_ARN = process.env.SCHEDULER_ROLE_ARN as string;

interface ScheduleConfigRecord {
    id: string;
    name: string;
    scheduleExpression: string;
    outbreakName: string;
    enabled: boolean;
}

/**
 * EventBridge Scheduler schedule names must match [0-9a-zA-Z-_.]{1,64}.
 * Derive the name from the immutable record id so renames never orphan a schedule.
 */
const scheduleNameFor = (id: string): string =>
    `aggregation-${id}`.replace(/[^0-9a-zA-Z-_.]/g, '-').slice(0, 64);

const toConfig = (
    image?: Record<string, unknown>,
): ScheduleConfigRecord | undefined => {
    if (!image) return undefined;
    // The stream image is DynamoDB-typed JSON; unmarshall converts it to plain values.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = unmarshall(image as any);
    return {
        id: String(data.id),
        name: String(data.name ?? ''),
        scheduleExpression: String(data.scheduleExpression ?? ''),
        outbreakName: String(data.outbreakName ?? ''),
        enabled: Boolean(data.enabled),
    };
};

const buildScheduleParams = (config: ScheduleConfigRecord) => ({
    Name: scheduleNameFor(config.id),
    Description: `Map data aggregation schedule for config "${config.name}" (${config.id})`,
    ScheduleExpression: config.scheduleExpression,
    FlexibleTimeWindow: { Mode: 'OFF' as const },
    State: (config.enabled ? 'ENABLED' : 'DISABLED') as 'ENABLED' | 'DISABLED',
    Target: {
        Arn: AGGREGATION_FUNCTION_ARN,
        RoleArn: SCHEDULER_ROLE_ARN,
        Input: JSON.stringify({
            outbreakName: config.outbreakName,
            configId: config.id,
        }),
    },
});

/** Create the schedule, falling back to update if it already exists. */
const createSchedule = async (config: ScheduleConfigRecord): Promise<void> => {
    const params = buildScheduleParams(config);
    try {
        await scheduler.send(new CreateScheduleCommand(params));
        console.log(`Created schedule ${params.Name}`);
    } catch (error) {
        if ((error as Error).name === 'ConflictException') {
            await scheduler.send(new UpdateScheduleCommand(params));
            console.log(`Schedule ${params.Name} already existed; updated it`);
            return;
        }
        throw error;
    }
};

/** Update the schedule, falling back to create if it does not exist yet. */
const updateSchedule = async (config: ScheduleConfigRecord): Promise<void> => {
    const params = buildScheduleParams(config);
    try {
        await scheduler.send(new UpdateScheduleCommand(params));
        console.log(`Updated schedule ${params.Name}`);
    } catch (error) {
        if ((error as Error).name === 'ResourceNotFoundException') {
            await scheduler.send(new CreateScheduleCommand(params));
            console.log(`Schedule ${params.Name} did not exist; created it`);
            return;
        }
        throw error;
    }
};

/** Remove the schedule, ignoring the case where it is already gone. */
const deleteSchedule = async (id: string): Promise<void> => {
    const Name = scheduleNameFor(id);
    try {
        await scheduler.send(new DeleteScheduleCommand({ Name }));
        console.log(`Deleted schedule ${Name}`);
    } catch (error) {
        if ((error as Error).name === 'ResourceNotFoundException') {
            console.log(`Schedule ${Name} was already removed`);
            return;
        }
        throw error;
    }
};

const processRecord = async (record: DynamoDBRecord): Promise<void> => {
    switch (record.eventName) {
        case 'INSERT': {
            const config = toConfig(record.dynamodb?.NewImage);
            if (config) await createSchedule(config);
            break;
        }
        case 'MODIFY': {
            const config = toConfig(record.dynamodb?.NewImage);
            if (config) await updateSchedule(config);
            break;
        }
        case 'REMOVE': {
            const config = toConfig(record.dynamodb?.OldImage);
            if (config) await deleteSchedule(config.id);
            break;
        }
        default:
            break;
    }
};

export const handler: DynamoDBStreamHandler = async (event) => {
    for (const record of event.Records) {
        try {
            await processRecord(record);
        } catch (error) {
            console.error(
                `Failed to process ${record.eventName} record:`,
                error,
            );
            // Re-throw so the stream retries; an unhandled schedule is worse than a retry.
            throw error;
        }
    }
};

