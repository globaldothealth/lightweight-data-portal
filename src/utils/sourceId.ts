import {v5 as uuidv5} from 'uuid';
/**
 * Source id generation. Mirrors the Python reference used to name the PDFs:
 *
 *     uuid.uuid5(uuid.NAMESPACE_URL, normalize_url(url))
 *
 * The UUIDv5 part comes from the `uuid` package; `normalizeUrl` is a line-by-line port of the Python
 * normalization and must NOT be changed: ids are the S3 file names, so any change would orphan existing files.
 * `new URL()` is deliberately not used because it normalizes differently from Python's urllib.
 */
const TRACKING_PARAMS = new Set(['fbclid', 'gclid', 'mc_cid', 'mc_eid']);
/** Python's urllib.parse.unquote (UTF-8, invalid sequences replaced). */
function percentDecode(value: string): string {
    return value.replace(/(?:%[0-9a-fA-F]{2})+/g, (run) => {
        const bytes = new Uint8Array(run.length / 3);
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(run.slice(i * 3 + 1, i * 3 + 3), 16);
        }
        return new TextDecoder('utf-8').decode(bytes);
    });
}

/** Python's urllib.parse.quote_plus. */
function quotePlus(value: string): string {
    return encodeURIComponent(value)
        .replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
        .replace(/%20/g, '+');
}

/** Python's parse_qsl(query, keep_blank_values=True). */
function parseQuery(query: string): [string, string][] {
    const pairs: [string, string][] = [];
    query.split('&').forEach((segment) => {
        if (!segment) return;
        const eq = segment.indexOf('=');
        const rawName = eq === -1 ? segment : segment.slice(0, eq);
        const rawValue = eq === -1 ? '' : segment.slice(eq + 1);
        pairs.push([
            percentDecode(rawName.replace(/\+/g, ' ')),
            percentDecode(rawValue.replace(/\+/g, ' ')),
        ]);
    });
    return pairs;
}

export function normalizeUrl(url: string): string {
    // urlsplit removes tabs/newlines; the reference also strips surrounding whitespace first.
    const cleaned = url.trim().replace(/[\t\r\n]/g, '');

    let rest = cleaned;
    let scheme = '';
    const schemeMatch = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(rest);
    if (schemeMatch) {
        scheme = schemeMatch[1];
        rest = rest.slice(schemeMatch[0].length);
    }

    let netloc = '';
    if (rest.startsWith('//')) {
        const end = rest.slice(2).search(/[/?#]/);
        netloc = end === -1 ? rest.slice(2) : rest.slice(2, 2 + end);
        rest = end === -1 ? '' : rest.slice(2 + end);
    }

    const hashIndex = rest.indexOf('#');
    if (hashIndex !== -1) {
        rest = rest.slice(0, hashIndex); // fragment is dropped
    }
    const queryIndex = rest.indexOf('?');
    const rawPath = queryIndex === -1 ? rest : rest.slice(0, queryIndex);
    const rawQuery = queryIndex === -1 ? '' : rest.slice(queryIndex + 1);

    const query = parseQuery(rawQuery)
        .filter(([key]) => {
            const lower = key.toLowerCase();
            return !lower.startsWith('utm_') && !TRACKING_PARAMS.has(lower);
        })
        .sort(([k1, v1], [k2, v2]) => (k1 < k2 ? -1 : k1 > k2 ? 1 : v1 < v2 ? -1 : v1 > v2 ? 1 : 0))
        .map(([key, value]) => `${quotePlus(key)}=${quotePlus(value)}`)
        .join('&');

    let path = rawPath.replace(/\/+$/, '') || '/';
    if (!path.startsWith('/')) {
        path = `/${path}`;
    }

    return `${scheme.toLowerCase()}://${netloc.toLowerCase()}${path}${query ? `?${query}` : ''}`;
}

export function sourceId(url: string): string {
    return uuidv5(normalizeUrl(url), uuidv5.URL);
}

