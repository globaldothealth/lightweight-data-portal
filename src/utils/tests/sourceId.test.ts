import {describe, expect, it} from 'vitest';
import {normalizeUrl, sourceId} from '../sourceId';

// Expected values were produced by the Python reference implementation:
//   uuid.uuid5(uuid.NAMESPACE_URL, normalize_url(url))
// If one of these fails, the TypeScript port has diverged from the script that names the PDF files.
const REFERENCE_CASES: { url: string; normalized: string; id: string }[] = [
    {
        url: 'https://Example.com/news/?utm_source=x#top',
        normalized: 'https://example.com/news',
        id: 'ba26c79e-ce75-502e-b382-e2268b0f2df7',
    },
    {
        url: 'https://example.com/news',
        normalized: 'https://example.com/news',
        id: 'ba26c79e-ce75-502e-b382-e2268b0f2df7',
    },
    {
        url: 'https://example.com/a/b/?b=2&a=1&utm_medium=m&fbclid=zz',
        normalized: 'https://example.com/a/b?a=1&b=2',
        id: '39a27fea-095d-5378-8e5f-2b94e037e4cd',
    },
    {
        url: 'https://example.com/search?q=hello+world&x=%C3%A9&y=a%20b&flag',
        normalized: 'https://example.com/search?flag=&q=hello+world&x=%C3%A9&y=a+b',
        id: '08603df1-2178-5274-ba3b-19f9c40e21da',
    },
    {
        url: "https://example.com/p?q=it's (ok)*!~_.-&empty=",
        normalized: 'https://example.com/p?empty=&q=it%27s+%28ok%29%2A%21~_.-',
        id: '843fb285-aa5b-5c6d-87eb-e1d73f203467',
    },
    {
        url: 'http://EXAMPLE.com:8080/Path/Case/',
        normalized: 'http://example.com:8080/Path/Case',
        id: '3d17255b-7cb3-505b-a89f-fc3b2a4791eb',
    },
    {url: 'https://example.com', normalized: 'https://example.com/', id: 'dd2c1780-811a-5296-81c5-178a0ef488bc'},
    {url: 'https://example.com/?', normalized: 'https://example.com/', id: 'dd2c1780-811a-5296-81c5-178a0ef488bc'},
    {
        url: 'https://user:Pass@Example.com/x/',
        normalized: 'https://user:pass@example.com/x',
        id: '9ea07310-39a5-588e-a2e0-066d1b8a7946',
    },
    {
        url: '  https://example.com/trim  ',
        normalized: 'https://example.com/trim',
        id: '8728bece-be32-5380-a4b0-dcc407b671fe',
    },
    {
        url: 'https://example.com/a?x=1&&y=2&=3',
        normalized: 'https://example.com/a?=3&x=1&y=2',
        id: 'f532daa3-8300-5034-a860-18b423bdcd05',
    },
    // Real rows from GHL2026_ebolabvd_source_mapping.csv
    {
        url: 'https://www.reuters.com/business/healthcare-pharmaceuticals/uganda-discharge-last-ebola-patient-spokesperson-says-2026-07-16/',
        normalized: 'https://www.reuters.com/business/healthcare-pharmaceuticals/uganda-discharge-last-ebola-patient-spokesperson-says-2026-07-16',
        id: 'dd7ff38c-3d62-5613-9379-2bd51fa2e225',
    },
    {
        url: 'https://www.monitor.co.ug/uganda/news/national/second-ebola-patient-in-uganda-tests-negative-5468776',
        normalized: 'https://www.monitor.co.ug/uganda/news/national/second-ebola-patient-in-uganda-tests-negative-5468776',
        id: '054a0369-d964-56f8-9220-a9c4dd4074ea',
    },
    {
        url: 'https://www.washingtonpost.com/health/2026/05/27/doctor-evacuated-ebola-exposure-describes-lie-congo-quarantine/',
        normalized: 'https://www.washingtonpost.com/health/2026/05/27/doctor-evacuated-ebola-exposure-describes-lie-congo-quarantine',
        id: 'e99fcad8-f2dc-5701-9547-b48afcee8f7a',
    },
];

describe('sourceId', () => {
    it.each(REFERENCE_CASES)('matches the Python reference for $url', ({url, normalized, id}) => {
        expect(normalizeUrl(url)).toBe(normalized);
        expect(sourceId(url)).toBe(id);
    });

    it('gives the same id to URL variants that normalize identically', () => {
        expect(sourceId('https://Example.com/news/?utm_source=x#top')).toBe(sourceId('https://example.com/news'));
    });
});

