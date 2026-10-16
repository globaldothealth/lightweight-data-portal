import {describe, expect, it} from 'vitest';
import {isValidSnapshotDate, snapshotId, snapshotPdfPath, todayUtc} from '../snapshot';

describe('isValidSnapshotDate', () => {
    it.each(['2026-10-07', '2024-02-29', '2026-01-01', '2026-12-31'])('accepts %s', (value) => {
        expect(isValidSnapshotDate(value)).toBe(true);
    });

    it.each([
        '',
        '2026-1-7',
        '07-10-2026',
        '2026/10/07',
        '2026-13-01',
        '2026-00-10',
        '2026-02-30', // would roll over to March
        '2025-02-29', // not a leap year
        '2026-10-07T10:00:00Z',
        ' 2026-10-07',
    ])('rejects "%s"', (value) => {
        expect(isValidSnapshotDate(value)).toBe(false);
    });
});

describe('snapshot keys', () => {
    const location = {
        outbreakName: 'Ebola BVD',
        sourceId: 'a5f9cae0-1b7f-562d-8ada-a8ce3763d820',
        capturedAt: '2026-10-07',
    };

    it('builds a deterministic id, so the same date cannot be added twice for a source', () => {
        expect(snapshotId(location.sourceId, location.capturedAt)).toBe('a5f9cae0-1b7f-562d-8ada-a8ce3763d820_2026-10-07');
    });

    it('builds the S3 key <outbreak>/<sourceId>/<date>.pdf', () => {
        expect(snapshotPdfPath(location)).toBe('Ebola BVD/a5f9cae0-1b7f-562d-8ada-a8ce3763d820/2026-10-07.pdf');
    });

    it('gives different dates of the same source different keys', () => {
        expect(snapshotPdfPath(location)).not.toBe(snapshotPdfPath({...location, capturedAt: '2026-10-08'}));
    });
});

describe('todayUtc', () => {
    it('is a valid snapshot date', () => {
        expect(isValidSnapshotDate(todayUtc())).toBe(true);
    });
});

