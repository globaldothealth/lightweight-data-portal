import {client} from "./amplifyClient";
import type {ImportPlan, SourceStatus} from "./sourceImport";

export const SOURCES_BUCKET = 'gh-outbreak-sources';
const WRITE_CONCURRENCY = 5;

export interface SourceRecord {
    id: string;
    url: string;
    outbreakName: string;
    status: SourceStatus;
    downloadedAt?: string | null;
    verifiedBy?: string | null;
    verifiedAt?: string | null;
    errorMessage?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface ImportResult {
    created: number;
    failed: { id: string; message: string }[];
}

/** S3 key of a source's PDF: the record id doubles as the file name. */
export const sourcePdfPath = (source: Pick<SourceRecord, 'outbreakName' | 'id'>) =>
    `${source.outbreakName}/${source.id}.pdf`;

/** All Source records of an outbreak (optionally of a single status), following pagination. */
async function listSources(outbreakName: string, status?: SourceStatus): Promise<SourceRecord[]> {
    const records: SourceRecord[] = [];
    let nextToken: string | null | undefined;

    do {
        // Sort key conditions on index queries take an operator object ({eq: ...}), not a bare value.
        const response = await client.models.Source.listSourcesByOutbreakAndStatus(
            status ? {outbreakName, status: {eq: status}} : {outbreakName},
            {nextToken, limit: 1000},
        );
        if (response.errors?.length) {
            throw new Error(response.errors[0].message);
        }
        records.push(...(response.data ?? []).map((source) => ({...source, status: source.status as SourceStatus})));
        nextToken = response.nextToken;
    } while (nextToken);

    return records;
}

/** Sources of an outbreak with the given status, sorted by URL. */
export async function fetchSourcesForOutbreak(outbreakName: string, status: SourceStatus): Promise<SourceRecord[]> {
    const records = await listSources(outbreakName, status);
    // Safety net: never show records of another status, whatever the backend returned.
    return records.filter((source) => source.status === status).sort((a, b) => a.url.localeCompare(b.url));
}

/** Ids of all existing Source records of an outbreak, whatever their status. */
export async function fetchExistingSourceIds(outbreakName: string): Promise<Set<string>> {
    return new Set((await listSources(outbreakName)).map((source) => source.id));
}

/** Creates the planned sources as PENDING_VERIFICATION, a few at a time. Existing records are never overwritten. */
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
                const {errors} = await client.models.Source.create({id, url, outbreakName, status: 'PENDING_VERIFICATION'});
                if (errors?.length) {
                    throw new Error(errors[0].message);
                }
                result.created++;
            } catch (error: unknown) {
                result.failed.push({id, message: error instanceof Error ? error.message : 'Unknown error'});
            }
            onProgress(++done, total);
        }));
    }

    return result;
}

export async function verifySource(id: string, verifiedBy: string): Promise<void> {
    const {errors} = await client.models.Source.update({
        id,
        status: 'VERIFIED',
        verifiedBy,
        verifiedAt: new Date().toISOString(),
    });
    if (errors?.length) {
        throw new Error(errors[0].message);
    }
}

export async function unverifySource(id: string): Promise<void> {
    const {errors} = await client.models.Source.update({
        id,
        status: 'PENDING_VERIFICATION',
        verifiedBy: null,
        verifiedAt: null,
    });
    if (errors?.length) {
        throw new Error(errors[0].message);
    }
}

