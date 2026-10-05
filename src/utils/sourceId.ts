/**
 * Source id generation. This is a line-by-line port of the Python reference used to name the PDFs:
 *
 *     uuid.uuid5(uuid.NAMESPACE_URL, normalize_url(url))
 *
 * Do NOT change the normalization rules: ids are the S3 file names, so any change would orphan existing files.
 * `new URL()` is deliberately not used because it normalizes differently from Python's urllib.
 */

const TRACKING_PARAMS = new Set(['fbclid', 'gclid', 'mc_cid', 'mc_eid']);

// uuid.NAMESPACE_URL
const NAMESPACE_URL_BYTES = hexToBytes('6ba7b8119dad11d180b400c04fd430c8');

function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
}

/** Synchronous SHA-1 (needed for UUIDv5; avoids async Web Crypto and extra dependencies). */
function sha1(data: Uint8Array): Uint8Array {
    const h = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];
    const paddedLength = Math.ceil((data.length + 9) / 64) * 64;
    const padded = new Uint8Array(paddedLength);
    padded.set(data);
    padded[data.length] = 0x80;

    const view = new DataView(padded.buffer);
    const bitLength = data.length * 8;
    view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000));
    view.setUint32(paddedLength - 4, bitLength >>> 0);

    const w = new Uint32Array(80);
    for (let offset = 0; offset < paddedLength; offset += 64) {
        for (let i = 0; i < 16; i++) {
            w[i] = view.getUint32(offset + i * 4);
        }
        for (let i = 16; i < 80; i++) {
            const x = w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16];
            w[i] = (x << 1) | (x >>> 31);
        }

        let [a, b, c, d, e] = h;
        for (let i = 0; i < 80; i++) {
            let f: number;
            let k: number;
            if (i < 20) {
                f = (b & c) | (~b & d);
                k = 0x5a827999;
            } else if (i < 40) {
                f = b ^ c ^ d;
                k = 0x6ed9eba1;
            } else if (i < 60) {
                f = (b & c) | (b & d) | (c & d);
                k = 0x8f1bbcdc;
            } else {
                f = b ^ c ^ d;
                k = 0xca62c1d6;
            }
            const temp = (((a << 5) | (a >>> 27)) + f + e + k + w[i]) >>> 0;
            e = d;
            d = c;
            c = ((b << 30) | (b >>> 2)) >>> 0;
            b = a;
            a = temp;
        }

        h[0] = (h[0] + a) >>> 0;
        h[1] = (h[1] + b) >>> 0;
        h[2] = (h[2] + c) >>> 0;
        h[3] = (h[3] + d) >>> 0;
        h[4] = (h[4] + e) >>> 0;
    }

    const out = new Uint8Array(20);
    const outView = new DataView(out.buffer);
    h.forEach((value, i) => outView.setUint32(i * 4, value));
    return out;
}

function uuid5(name: string): string {
    const nameBytes = new TextEncoder().encode(name);
    const input = new Uint8Array(NAMESPACE_URL_BYTES.length + nameBytes.length);
    input.set(NAMESPACE_URL_BYTES);
    input.set(nameBytes, NAMESPACE_URL_BYTES.length);

    const bytes = sha1(input).slice(0, 16);
    bytes[6] = (bytes[6] & 0x0f) | 0x50; // version 5
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant

    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

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
    return uuid5(normalizeUrl(url));
}

