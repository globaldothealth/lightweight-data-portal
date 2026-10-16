import {describe, expect, it} from 'vitest';
import {Group} from '../../../models/User';
import type {RootState} from '../../store';
import type {SourcesTabKey} from '../slice';
import {selectActiveTab, selectVisibleTabs} from '../selectors';

const createState = (groups: Group[] | undefined, selectedTab: SourcesTabKey = 'browse') =>
    ({
        app: {userProfile: groups && {username: 'u', email: 'u@example.com', groups}},
        sources: {selectedTab},
    }) as unknown as RootState;

const keys = (state: RootState) => selectVisibleTabs(state).map((tab) => tab.key);

describe('Sources selectors', () => {
    it('shows every tab to a curator who is also an admin', () => {
        expect(keys(createState([Group.ADMINS, Group.CURATORS]))).toEqual(['browse', 'verify', 'missing', 'import']);
    });

    it('shows verify, missing and import to an admin', () => {
        expect(keys(createState([Group.ADMINS]))).toEqual(['verify', 'missing', 'import']);
    });

    it('shows browse, verify and missing to a curator', () => {
        expect(keys(createState([Group.CURATORS]))).toEqual(['browse', 'verify', 'missing']);
    });

    it('shows no tabs to a researcher or without a profile', () => {
        expect(keys(createState([Group.RESEARCHERS]))).toEqual([]);
        expect(keys(createState(undefined))).toEqual([]);
    });

    it('returns the selected tab when it is visible', () => {
        expect(selectActiveTab(createState([Group.CURATORS], 'missing'))).toBe('missing');
    });

    it('falls back to the first visible tab when the selected one is not available', () => {
        expect(selectActiveTab(createState([Group.ADMINS], 'browse'))).toBe('verify');
    });

    it('returns undefined when there are no visible tabs', () => {
        expect(selectActiveTab(createState([Group.RESEARCHERS]))).toBeUndefined();
    });
});

