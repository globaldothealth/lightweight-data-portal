import Papa from "papaparse";
import {sourceId} from "./sourceId";

export type SourceStatus = 'PENDING_VERIFICATION' | 'VERIFIED';

export interface SourceCsvRow {
    /** 1-based number of the data row (header excluded, blank lines ignored). */
    rowNumber: number;
    url: string;
    id: string;
}

export interface InvalidRow {
    rowNumber: number;
    reason: string;
}

export interface ParsedSourceCsv {
    rows: SourceCsvRow[];
    invalid: InvalidRow[];
    /** File-level error (e.g. missing columns). When set, rows is empty. */
    error?: string;
}

export interface ImportPlan {
    /** Sources that do not exist yet; they are always created as PENDING_VERIFICATION. */
    toCreate: { id: string; url: string }[];
    /** Rows whose id already exists; existing sources are never modified. */
    unchanged: number;
}

// Source ids are UUIDv5 values derived from the normalized URL.
const UUID_V5_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isHttpUrl(value: string): boolean {
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

export function parseSourceCsv(text: string): ParsedSourceCsv {
    // PapaParse handles quoting, CRLF/LF and the BOM. Headers are matched case-insensitively.
    const parsed = Papa.parse<Record<string, string | undefined>>(text, {
        header: true,
        delimiter: ',',
        skipEmptyLines: 'greedy',
        transformHeader: (header) => header.trim().toLowerCase(),
    });

    const fields = parsed.meta.fields ?? [];
    if (fields.length === 0) {
        return {rows: [], invalid: [], error: 'The file is empty.'};
    }
    // The "id" column is optional: blank/missing ids are generated from the URL.
    if (!fields.includes('url')) {
        return {rows: [], invalid: [], error: 'The CSV must have a "url" column in the header row.'};
    }

    const rows: SourceCsvRow[] = [];
    const invalid: InvalidRow[] = [];
    const firstRowById = new Map<string, number>();

    parsed.data.forEach((record, index) => {
        const rowNumber = index + 1;
        const url = (record.url ?? '').trim();
        const providedId = (record.id ?? '').trim().toLowerCase();

        if (!url || !isHttpUrl(url)) {
            invalid.push({rowNumber, reason: 'Missing or invalid URL (must start with http:// or https://).'});
            return;
        }
        if (providedId && !UUID_V5_REGEX.test(providedId)) {
            invalid.push({rowNumber, reason: `Id "${providedId}" is not a valid UUIDv5.`});
            return;
        }
        // A provided id is kept as-is (it is the S3 file name). A missing one is derived from the URL.
        const id = providedId || sourceId(url);
        const firstRow = firstRowById.get(id);
        if (firstRow !== undefined) {
            invalid.push({rowNumber, reason: `Duplicate id (already used in row ${firstRow}).`});
            return;
        }

        firstRowById.set(id, rowNumber);
        rows.push({rowNumber, url, id});
    });

    return {rows, invalid};
}

/**
 * Decides what to write for each row. Safe to run repeatedly with the same CSV:
 * - unknown id  -> create (always as PENDING_VERIFICATION, whether or not the PDF is already in S3)
 * - known id    -> left untouched
 */
export function buildImportPlan(rows: SourceCsvRow[], existingIds: Set<string>): ImportPlan {
    const plan: ImportPlan = {toCreate: [], unchanged: 0};

    rows.forEach(({id, url}) => {
        if (existingIds.has(id)) {
            plan.unchanged++;
        } else {
            plan.toCreate.push({id, url});
        }
    });

    return plan;
}



