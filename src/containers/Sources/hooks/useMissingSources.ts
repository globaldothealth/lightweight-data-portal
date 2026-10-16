import {useEffect} from "react";
import type {OutbreakName} from "../../../config/outbreaks.ts";
import {useAppDispatch, useAppSelector} from "../../../hooks/redux.ts";
import {selectMissingSources} from "../../../redux/sources/selectors.ts";
import {loadMissingSources} from "../../../redux/sources/thunk.ts";

/** Loads the sources of an outbreak that have no snapshot. Removing a source after adding a snapshot is done by the store. */
export function useMissingSources(outbreakName: OutbreakName | '') {
    const dispatch = useAppDispatch();
    const list = useAppSelector(selectMissingSources);

    useEffect(() => {
        if (outbreakName) {
            dispatch(loadMissingSources(outbreakName));
        }
    }, [dispatch, outbreakName]);

    // Until the request for the selected outbreak starts, the list still belongs to another one.
    const stale = list.outbreakName !== outbreakName;
    return {
        sources: stale ? [] : list.items,
        loading: outbreakName !== '' && (list.loading || stale),
        loadError: stale ? null : list.error,
    };
}

