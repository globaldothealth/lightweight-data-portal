import {useState} from "react";
import {getUrl} from "aws-amplify/storage";
import {SOURCES_BUCKET, SourceRecord, sourcePdfPath} from "../../utils/sourcesApi";

/** Opens a source's PDF in a new tab through a signed S3 URL. Failures are reported through `onError`. */
export function useOpenSourcePdf(onError: (message: string) => void) {
    const [openingId, setOpeningId] = useState<string | null>(null);

    const openPdf = async (source: SourceRecord) => {
        setOpeningId(source.id);
        try {
            const {url} = await getUrl({path: sourcePdfPath(source), options: {bucket: SOURCES_BUCKET}});
            window.open(url.toString(), '_blank');
        } catch (err: unknown) {
            onError(`Failed to open PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setOpeningId(null);
        }
    };

    return {openingId, openPdf};
}

