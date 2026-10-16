import {client} from "./amplifyClient";
import type {ImportPlan} from "./sourceImport";

export const SOURCES_BUCKET = 'gh-outbreak-sources';
export const WRITE_CONCURRENCY = 5;

export interface SourceRecord {
    id: string;
    url: string;
    outbreakName: string;
}

export interface ImportResult {
    created: number;
    failed: { id: string; message: string }[];
}

/** All Source records of an outbreak, following pagination. */
export async function listSources(outbreakName: string): Promise<SourceRecord[]> {
    const records: SourceRecord[] = [];
    let nextToken: string | null | undefined;

    do {
        const response = await client.models.Source.listSourcesByOutbreak({outbreakName}, {nextToken, limit: 1000});
        if (response.errors?.length) {
            throw new Error(response.errors[0].message);
        }
        records.push(...(response.data ?? []).map(({id, url, outbreakName}) => ({id, url, outbreakName})));
        nextToken = response.nextToken;
    } while (nextToken);

    return records;
}

/** All sources of an outbreak, sorted by URL. */
export async function fetchSources(outbreakName: string): Promise<SourceRecord[]> {
    return (await listSources(outbreakName)).sort((a, b) => a.url.localeCompare(b.url));
}

/** Ids of all existing Source records of an outbreak. */
export async function fetchExistingSourceIds(outbreakName: string): Promise<Set<string>> {
    return new Set((await listSources(outbreakName)).map((source) => source.id));
}

/** Creates the planned sources, a few at a time. Existing records are never overwritten. */
export async function applyImportPlan(
    plan: ImportPlan,
    outbreakName: string,
    onProgress: (done: number, total: number) => void,
): Promise<ImportResult> {
    const result: ImportResult = {created: 0, failed: []};
    const total = plan.toCreate.length;
    let done = 0;

    for (let start = 0; start < total; start += WRITE_CONCURRENCY) {
        await Promise.all(plan.toCreate.slice(start, start + WRITE_CONCURRENCY).map(async ({id, url}) => {
            try {
                // Create fails if the id already exists.
                const {errors} = await client.models.Source.create({id, url, outbreakName});
                if (errors?.length) {
                    result.failed.push({id, message: errors[0].message});
                } else {
                    result.created++;
                }
            } catch (error: unknown) {
                result.failed.push({id, message: error instanceof Error ? error.message : 'Unknown error'});
            }
            onProgress(++done, total);
        }));
    }

    return result;
}

