import {createSelector} from '@reduxjs/toolkit';
import {Group} from '../../models/User';
import {selectUserProfile} from '../app/selectors';
import type {RootState} from '../store';
import type {SourceStatus} from '../../utils/sourceImport';
import type {SnapshotRecord} from '../../utils/snapshotsApi';
import type {SourceRecord} from '../../utils/sourcesApi';
import type {ListState, SourcesTabKey} from './types';

export const selectMissingSources: (state: RootState) => ListState<SourceRecord> = (state) => state.sources.missing;

export const selectSnapshotList = (status: SourceStatus) => (state: RootState): ListState<SnapshotRecord> =>
    state.sources.snapshots[status];

export interface SourcesTab {
    key: SourcesTabKey;
    label: string;
}

const selectSelectedTab: (state: RootState) => SourcesTabKey = (state) => state.sources.selectedTab;

/** Tabs the current user may see, in display order. */
export const selectVisibleTabs: (state: RootState) => SourcesTab[] = createSelector(
    [selectUserProfile],
    (userProfile) => {
        const groups = userProfile?.groups ?? [];
        const isAdmin = groups.includes(Group.ADMINS);
        const isCurator = groups.includes(Group.CURATORS);
        const canVerifySources = isAdmin || isCurator;

        const tabs: (SourcesTab & { visible: boolean })[] = [
            {key: 'browse', label: 'Browse Sources', visible: isCurator},
            {key: 'verify', label: 'Verify Sources', visible: canVerifySources},
            {key: 'missing', label: 'Missing Sources', visible: canVerifySources},
            {key: 'import', label: 'Import Sources', visible: isAdmin},
        ];

        return tabs.filter((tab) => tab.visible).map(({key, label}) => ({key, label}));
    },
);

/** The selected tab, or the first visible one when the selection is not available to the user. */
export const selectActiveTab: (state: RootState) => SourcesTabKey | undefined = createSelector(
    [selectSelectedTab, selectVisibleTabs],
    (selectedTab, tabs) => (tabs.some((tab) => tab.key === selectedTab) ? selectedTab : tabs[0]?.key),
);

