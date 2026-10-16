import {useEffect} from "react";
import type {OutbreakName} from "../../../config/outbreaks.ts";
import {useAppDispatch, useAppSelector} from "../../../hooks/redux.ts";
import {selectSnapshotList} from "../../../redux/sources/selectors.ts";
import {loadSnapshots} from "../../../redux/sources/thunk.ts";
import type {SourceStatus} from "../../../utils/sourceImport.ts";

/**
 * Loads the snapshots of an outbreak with the given status. Verifying, unverifying and removing a snapshot
 * update the list in the store, so the component does not have to.
 */
export function useSnapshotList(outbreakName: OutbreakName | '', status: SourceStatus) {
    const dispatch = useAppDispatch();
    const list = useAppSelector(selectSnapshotList(status));

    useEffect(() => {
        if (outbreakName) {
            dispatch(loadSnapshots({outbreakName, status}));
        }
    }, [dispatch, outbreakName, status]);

    // Until the request for the selected outbreak starts, the list still belongs to another one.
    const stale = list.outbreakName !== outbreakName;
    return {
        snapshots: stale ? [] : list.items,
        loading: outbreakName !== '' && (list.loading || stale),
        loadError: stale ? null : list.error,
    };
}
