export interface OutbreakConfig {
    /** Public URL of the source CSV linelist */
    dataUrl: string;
}

/**
 * Single source of truth for all supported outbreaks.
 *
 * This object is consumed by:
 *  - The UI dropdown  (OUTBREAK_OPTIONS / OutbreakName)
 *  - amplify/backend.ts, which serialises it as the Lambda env var OUTBREAK_CONFIGS
 *  - The Python aggregation Lambda, which reads OUTBREAK_CONFIGS at runtime to look up each outbreak's data URL.
 *
 * To add a new outbreak, append an entry here and implement the corresponding parser in the aggregation Lambda.
export const OUTBREAK_CONFIGS = {
    'Ebola BVD': {
        dataUrl:
            'https://raw.githubusercontent.com/globaldothealth/outbreak-data/refs/heads/main/Ebola%20BVD/Data/Ebola%20BVD%202026%20linelist%20-%20PUBLIC%20VIEW.csv',
    },
} as const satisfies Record<string, OutbreakConfig>;

export type OutbreakName = keyof typeof OUTBREAK_CONFIGS;

/** Ordered list for UI dropdowns — derived directly from OUTBREAK_CONFIGS. */
export const OUTBREAK_OPTIONS = Object.keys(OUTBREAK_CONFIGS) as OutbreakName[];

