import {describe, expect, it} from 'vitest';
import {buildImportPlan, parseSourceCsv, SourceStatus} from '../sourceImport';

const ID_A = 'a971f0c5-9842-5769-aba2-654277b34f38';
const ID_B = 'f4f3907d-94ef-56d5-b9af-d9cb8378735f';
const ID_C = 'c3650651-5102-5400-beae-0d70939fa46a';

describe('parseSourceCsv', () => {
    it('parses valid rows', () => {
        const result = parseSourceCsv(`url,id\nhttps://a.com/x,${ID_A}\nhttps://b.com/y,${ID_B.toUpperCase()}`);
        expect(result.error).toBeUndefined();
        expect(result.invalid).toEqual([]);
        expect(result.rows).toEqual([
            {rowNumber: 1, url: 'https://a.com/x', id: ID_A},
            {rowNumber: 2, url: 'https://b.com/y', id: ID_B},
        ]);
    });

    it('ignores extra columns and header casing', () => {
        const result = parseSourceCsv(`,URL, Id \n0,https://a.com/x,${ID_A}`);
        expect(result.rows).toEqual([{rowNumber: 1, url: 'https://a.com/x', id: ID_A}]);
    });

    it('returns a file-level error when the url column is missing or the file is empty', () => {
        expect(parseSourceCsv('').error).toMatch(/empty/i);
        expect(parseSourceCsv('link,name\nx,y').error).toMatch(/"url" column/);
    });

    it('generates the id from the URL when it is blank or the id column is absent', () => {
        const monitorUrl = 'https://www.monitor.co.ug/uganda/news/national/second-ebola-patient-in-uganda-tests-negative-5468776';
        const monitorId = '054a0369-d964-56f8-9220-a9c4dd4074ea'; // from the Python reference

        const blankId = parseSourceCsv(`url,id\n${monitorUrl},`);
        expect(blankId.invalid).toEqual([]);
        expect(blankId.rows).toEqual([{rowNumber: 1, url: monitorUrl, id: monitorId}]);

        const noIdColumn = parseSourceCsv(`url\n${monitorUrl}`);
        expect(noIdColumn.rows).toEqual([{rowNumber: 1, url: monitorUrl, id: monitorId}]);
    });

    it('keeps a provided id even if it differs from the one derived from the URL', () => {
        const result = parseSourceCsv(`url,id\nhttps://a.com/x,${ID_A}`);
        expect(result.rows[0].id).toBe(ID_A);
    });

    it('handles BOM, CRLF line endings, blank lines and quoted fields', () => {
        const result = parseSourceCsv(
            `\uFEFFurl,id\r\n"https://a.com/x?a=1,2",${ID_A}\r\n\r\nhttps://b.com/y,${ID_B}\r\n`,
        );
        expect(result.invalid).toEqual([]);
        expect(result.rows).toEqual([
            {rowNumber: 1, url: 'https://a.com/x?a=1,2', id: ID_A},
            {rowNumber: 2, url: 'https://b.com/y', id: ID_B},
        ]);
    });

    it('flags bad URLs, non-UUIDv5 ids and duplicates', () => {
        const result = parseSourceCsv([
            'url,id',
            `not-a-url,${ID_A}`,
            'https://a.com/3,not-a-uuid',
            'https://a.com/4,2cef85ac-6ee9-40d8-bead-35a853f5cc35', // v4, not v5
            `https://a.com/5,${ID_A}`,
            `https://a.com/6,${ID_A}`,
            'https://example.com/news,',
            'https://Example.com/news/?utm_source=x,', // same normalized URL as the row above
        ].join('\n'));

        expect(result.rows.map((r) => r.rowNumber)).toEqual([4, 6]);
        expect(result.invalid.map((i) => i.rowNumber)).toEqual([1, 2, 3, 5, 7]);
        expect(result.invalid[0].reason).toMatch(/invalid url/i);
        expect(result.invalid[3].reason).toMatch(/duplicate/i);
        expect(result.invalid[4].reason).toMatch(/duplicate/i);
    });
});

describe('buildImportPlan', () => {
    const rows = [
        {rowNumber: 1, url: 'https://a.com', id: ID_A},
        {rowNumber: 2, url: 'https://b.com', id: ID_B},
        {rowNumber: 3, url: 'https://c.com', id: ID_C},
    ];

    it('creates new rows with PENDING_VERIFICATION status', () => {
        const plan = buildImportPlan(rows, new Map(), new Set([ID_A]));
        expect(plan.toCreate).toEqual([
            {id: ID_A, url: 'https://a.com', status: 'PENDING_VERIFICATION'},
            {id: ID_B, url: 'https://b.com', status: 'PENDING_VERIFICATION'},
            {id: ID_C, url: 'https://c.com', status: 'PENDING_VERIFICATION'},
        ]);
        expect(plan.toUpdate).toEqual([]);
    });

    it('never updates existing sources', () => {
        const existing = new Map<string, SourceStatus>([[ID_A, 'PENDING_VERIFICATION'], [ID_B, 'VERIFIED']]);
        const plan = buildImportPlan(rows.slice(0, 2), existing, new Set([ID_A, ID_B]));
        expect(plan.toCreate).toEqual([]);
        expect(plan.toUpdate).toEqual([]);
        expect(plan.unchanged).toEqual(2);
    });

    it('is idempotent: re-running with the resulting state changes nothing', () => {
        const first = buildImportPlan(rows, new Map(), new Set([ID_A]));
        const afterFirst = new Map<string, SourceStatus>(first.toCreate.map((c) => [c.id, c.status]));
        const second = buildImportPlan(rows, afterFirst, new Set([ID_A]));
        expect(second).toEqual({toCreate: [], toUpdate: [], unchanged: 3});
    });
});

