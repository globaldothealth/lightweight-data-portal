import {getProperties, list, remove, uploadData} from "aws-amplify/storage";
import {client} from "./amplifyClient";
import {isValidSnapshotDate, snapshotId, snapshotPdfPath} from "./snapshot";
import type {ImportPlan, SourceStatus} from "./sourceImport";

export const SOURCES_BUCKET = 'gh-outbreak-sources';
const WRITE_CONCURRENCY = 5;

export interface SourceRecord {
    id: string;
    url: string;
    outbreakName: string;
}

export interface SnapshotRecord {
    id: string;
    sourceId: string;
    outbreakName: string;
    /** YYYY-MM-DD (UTC) */
    capturedAt: string;
    status: SourceStatus;
    verifiedBy?: string | null;
    verifiedAt?: string | null;
    /** URL of the source this snapshot belongs to. */
    url: string;
}

export interface ImportResult {
    created: number;
    failed: { id: string; message: string }[];
}

/** All Source records of an outbreak, following pagination. */
async function listSources(outbreakName: string): Promise<SourceRecord[]> {
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

/** Sources of an outbreak that have no snapshot at all (pending or verified), sorted by URL. */
export async function fetchSourcesWithoutSnapshots(outbreakName: string): Promise<SourceRecord[]> {
    const withSnapshot = new Set<string>();

    for (const status of ['PENDING_VERIFICATION', 'VERIFIED'] as const) {
        let nextToken: string | null | undefined;
        do {
            const response = await client.models.Snapshot.listSnapshotsByOutbreakAndStatus(
                {outbreakName, status: {eq: status}},
                {nextToken, limit: 1000, selectionSet: ['sourceId']},
            );
            if (response.errors?.length) {
                throw new Error(response.errors[0].message);
            }
            (response.data ?? []).forEach(({sourceId}) => withSnapshot.add(sourceId));
            nextToken = response.nextToken;
        } while (nextToken);
    }

    return (await fetchSources(outbreakName)).filter((source) => !withSnapshot.has(source.id));
}

/** Snapshots of an outbreak with the given status, with the URL of their source. Sorted by URL, newest first. */
export async function fetchSnapshotsForOutbreak(outbreakName: string, status: SourceStatus): Promise<SnapshotRecord[]> {
    const snapshots: Omit<SnapshotRecord, 'url'>[] = [];
    let nextToken: string | null | undefined;

    do {
        // Sort key conditions on index queries take an operator object ({eq: ...}), not a bare value.
        const response = await client.models.Snapshot.listSnapshotsByOutbreakAndStatus(
            {outbreakName, status: {eq: status}},
            {nextToken, limit: 1000},
        );
        if (response.errors?.length) {
            throw new Error(response.errors[0].message);
        }
        snapshots.push(...(response.data ?? []).map((snapshot) => ({...snapshot, status: snapshot.status as SourceStatus})));
        nextToken = response.nextToken;
    } while (nextToken);

    const urls = new Map((await listSources(outbreakName)).map((source) => [source.id, source.url]));
    return snapshots
        // Safety net: never show records of another status, whatever the backend returned.
        .filter((snapshot) => snapshot.status === status)
        .map((snapshot) => ({...snapshot, url: urls.get(snapshot.sourceId) ?? snapshot.sourceId}))
        .sort((a, b) => a.url.localeCompare(b.url) || b.capturedAt.localeCompare(a.capturedAt));
}

/**
 * Adds a snapshot of a source for a capture date, already VERIFIED by the given user.
 * - With a file, the PDF is uploaded to the snapshot's key.
 * - Without a file, the PDF must already be in S3 at that key (e.g. placed there by a scheduler).
 * A date can only be added once per source; an existing PDF is never overwritten by this call.
 */
export async function createSnapshot(source: SourceRecord, capturedAt: string, verifiedBy: string, file?: File): Promise<void> {
    if (!isValidSnapshotDate(capturedAt)) {
        throw new Error('Enter a valid snapshot date.');
    }

    const location = {outbreakName: source.outbreakName, sourceId: source.id, capturedAt};
    const path = snapshotPdfPath(location);
    const id = snapshotId(source.id, capturedAt);

    if (!file) {
        try {
            await getProperties({path, options: {bucket: SOURCES_BUCKET}});
        } catch {
            throw new Error(`No PDF found in S3 at ${path}. Select a file to upload one.`);
        }
    }

    // The record is created first: it fails when this date already exists, before any file is written.
    const {errors} = await client.models.Snapshot.create({
        id,
        ...location,
        status: 'VERIFIED',
        verifiedBy,
        verifiedAt: new Date().toISOString(),
    });
    if (errors?.length) {
        throw new Error(/conditional/i.test(errors[0].message)
            ? `This source already has a snapshot for ${capturedAt}.`
            : errors[0].message);
    }

    if (file) {
        try {
            await uploadData({path, data: file, options: {bucket: SOURCES_BUCKET, contentType: 'application/pdf'}}).result;
        } catch (error: unknown) {
            await client.models.Snapshot.delete({id}); // roll back, so no record points to a missing file
            throw error;
        }
    }
}

/** Replaces the PDF of an existing snapshot (same key). */
export async function replaceSnapshotPdf(snapshot: SnapshotRecord, file: File): Promise<void> {
    await uploadData({
        path: snapshotPdfPath(snapshot),
        data: file,
        options: {bucket: SOURCES_BUCKET, contentType: 'application/pdf'},
    }).result;
}

export async function verifySnapshot(id: string, verifiedBy: string): Promise<void> {
    const {errors} = await client.models.Snapshot.update({
        id,
        status: 'VERIFIED',
        verifiedBy,
        verifiedAt: new Date().toISOString(),
    });
    if (errors?.length) {
        throw new Error(errors[0].message);
    }
}

/** Deletes a snapshot: its record first, then its PDF, so no record is left pointing to a missing file. */
export async function deleteSnapshot(snapshot: SnapshotRecord): Promise<void> {
    const {errors} = await client.models.Snapshot.delete({id: snapshot.id});
    if (errors?.length) {
        throw new Error(errors[0].message);
    }
    try {
        await remove({path: snapshotPdfPath(snapshot), options: {bucket: SOURCES_BUCKET}});
    } catch (error: unknown) {
        throw new Error(`The snapshot was removed, but its PDF could not be deleted from S3: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
}

export async function unverifySnapshot(id: string): Promise<void> {
    const {errors} = await client.models.Snapshot.update({
        id,
        status: 'PENDING_VERIFICATION',
        verifiedBy: null,
        verifiedAt: null,
    });
    if (errors?.length) {
        throw new Error(errors[0].message);
    }
}

export interface SnapshotImportResult {
    /** PDFs found in S3 for the sources of the file. */
    pdfsFound: number;
    created: number;
    /** PDFs whose snapshot already existed. */
    existing: number;
    failed: { id: string; message: string }[];
}

const DATED_PDF_REGEX = /^(.+)\/([^/]+)\/(\d{4}-\d{2}-\d{2})\.pdf$/i;

/**
 * Lists the PDFs of an outbreak in S3 and returns the capture dates per source id.
 * Only <outbreak>/<sourceId>/<YYYY-MM-DD>.pdf is handled; any other key is ignored.
 */
async function listCapturedDates(outbreakName: string): Promise<Map<string, Set<string>>> {
    const {items} = await list({path: `${outbreakName}/`, options: {bucket: SOURCES_BUCKET, listAll: true}});
    const bySource = new Map<string, Set<string>>();

    items.forEach(({path}) => {
        const match = DATED_PDF_REGEX.exec(path);
        if (!match || match[1] !== outbreakName || !isValidSnapshotDate(match[3])) return;
        const dates = bySource.get(match[2]) ?? new Set<string>();
        dates.add(match[3]);
        bySource.set(match[2], dates);
    });

    return bySource;
}

/**
 * Creates a PENDING_VERIFICATION snapshot for every PDF already in S3 for the given sources.
 * Safe to repeat: existing snapshots are left untouched.
 */
export async function importSnapshotsFromS3(
    sources: { id: string }[],
    outbreakName: string,
    onProgress: (done: number, total: number) => void,
): Promise<SnapshotImportResult> {
    const result: SnapshotImportResult = {pdfsFound: 0, created: 0, existing: 0, failed: []};
    const total = sources.length;
    let done = 0;

    let datesBySource: Map<string, Set<string>>;
    try {
        datesBySource = await listCapturedDates(outbreakName);
    } catch (error: unknown) {
        result.failed.push({id: 'S3 listing', message: error instanceof Error ? error.message : 'Unknown error'});
        return result;
    }

    for (let start = 0; start < total; start += WRITE_CONCURRENCY) {
        await Promise.all(sources.slice(start, start + WRITE_CONCURRENCY).map(async ({id}) => {
            try {
                for (const capturedAt of datesBySource.get(id) ?? []) {
                    result.pdfsFound++;
                    const location = {outbreakName, sourceId: id, capturedAt};
                    const {errors} = await client.models.Snapshot.create({
                        id: snapshotId(id, capturedAt),
                        ...location,
                        status: 'PENDING_VERIFICATION',
                    });
                    if (errors?.length) {
                        if (/conditional/i.test(errors[0].message)) {
                            result.existing++;
                            continue;
                        }
                        result.failed.push({id, message: errors[0].message});
                        break;
                    }
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

