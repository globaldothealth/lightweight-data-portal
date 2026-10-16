/**
 * A snapshot is the content of a source (URL) on one date. It is identified by the source id and the capture date,
 * and its PDF lives at  <outbreakName>/<sourceId>/<capturedAt>.pdf  in the sources bucket.
 * Do NOT change these formats: they are the S3 keys of existing files.
 */

/** Capture dates are calendar days in UTC, formatted YYYY-MM-DD. */
export function isValidSnapshotDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    // Rejects dates that JS would silently roll over, such as 2026-02-31.
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function todayUtc(): string {
    return new Date().toISOString().slice(0, 10);
}

export function snapshotId(sourceId: string, capturedAt: string): string {
    return `${sourceId}_${capturedAt}`;
}

export interface SnapshotLocation {
    outbreakName: string;
    sourceId: string;
    capturedAt: string;
}

export function snapshotPdfPath({outbreakName, sourceId, capturedAt}: SnapshotLocation): string {
    return `${outbreakName}/${sourceId}/${capturedAt}.pdf`;
}

