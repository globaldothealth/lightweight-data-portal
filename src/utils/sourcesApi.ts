import {list} from "aws-amplify/storage";
import {client} from "./amplifyClient";
import type {ImportPlan, SourceStatus} from "./sourceImport";

export const SOURCES_BUCKET = 'gh-outbreak-sources';
const WRITE_CONCURRENCY = 5;

export interface ImportResult {
    created: number;
    updated: number;
    failed: { id: string; message: string }[];
}

/** All existing Source records of an outbreak, keyed by id. */
export async function fetchExistingSources(outbreakName: string): Promise<Map<string, SourceStatus>> {
    const existing = new Map<string, SourceStatus>();
    let nextToken: string | null | undefined;

    do {
        const response = await client.models.Source.listSourcesByOutbreakAndStatus(
            {outbreakName},
            {nextToken, limit: 1000},
        );
        if (response.errors?.length) {
            throw new Error(response.errors[0].message);
        }
        response.data.forEach((source) => existing.set(source.id, source.status as SourceStatus));
        nextToken = response.nextToken;
    } while (nextToken);

    return existing;
}

/** Ids of all PDF files stored under the outbreak's folder (file name without ".pdf"). */
export async function fetchSourceFileIds(outbreakName: string): Promise<Set<string>> {
    const result = await list({
        path: `${outbreakName}/`,
        options: {bucket: SOURCES_BUCKET, listAll: true},
    });

    const ids = new Set<string>();
    result.items.forEach((item) => {
        const name = item.path.split('/').pop() ?? '';
        if (name.toLowerCase().endsWith('.pdf')) {
            ids.add(name.slice(0, -'.pdf'.length).toLowerCase());
        }
    });
    return ids;
}

async function runWithConcurrency<T>(items: T[], limit: number, worker: (item: T) => Promise<void>) {
    let next = 0;
    const runners = Array.from({length: Math.min(limit, items.length)}, async () => {
        while (next < items.length) {
            const item = items[next++];
            await worker(item);
        }
    });
    await Promise.all(runners);
}

export async function applyImportPlan(
    plan: ImportPlan,
    outbreakName: string,
    onProgress: (done: number, total: number) => void,
): Promise<ImportResult> {
    const result: ImportResult = {created: 0, updated: 0, failed: []};
    const total = plan.toCreate.length + plan.toUpdate.length;
    let done = 0;

    const tasks: (() => Promise<void>)[] = [
        ...plan.toCreate.map((item) => async () => {
            // Create fails if the id already exists, so existing records are never overwritten.
            const {errors} = await client.models.Source.create({
                id: item.id,
                url: item.url,
                outbreakName,
                status: item.status,
            });
            if (errors?.length) {
                throw new Error(errors[0].message);
            }
            result.created++;
        }),
        ...plan.toUpdate.map((item) => async () => {
            const {errors} = await client.models.Source.update({id: item.id, status: item.status});
            if (errors?.length) {
                throw new Error(errors[0].message);
            }
            result.updated++;
        }),
    ];
    const ids = [...plan.toCreate.map((i) => i.id), ...plan.toUpdate.map((i) => i.id)];

    await runWithConcurrency(tasks.map((task, index) => ({task, id: ids[index]})), WRITE_CONCURRENCY, async ({task, id}) => {
        try {
            await task();
        } catch (error: unknown) {
            result.failed.push({id, message: error instanceof Error ? error.message : 'Unknown error'});
        }
        done++;
        onProgress(done, total);
    });

    return result;
}

