import {useState} from "react";
import {getUrl} from "aws-amplify/storage";
import {snapshotPdfPath} from "../../../utils/snapshot.ts";
import {SOURCES_BUCKET} from "../../../utils/sourcesApi.ts";
import type {SnapshotRecord} from "../../../utils/snapshotsApi.ts";

/** Opens a snapshot's PDF in a new tab through a signed S3 URL. Failures are reported through `onError`. */
export function useOpenSnapshotPdf(onError: (message: string) => void) {
    const [openingId, setOpeningId] = useState<string | null>(null);

    const openPdf = async (snapshot: SnapshotRecord) => {
        setOpeningId(snapshot.id);
        try {
            const {url} = await getUrl({path: snapshotPdfPath(snapshot), options: {bucket: SOURCES_BUCKET}});
            window.open(url.toString(), '_blank');
        } catch (err: unknown) {
            onError(`Failed to open PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setOpeningId(null);
        }
    };

    return {openingId, openPdf};
}

