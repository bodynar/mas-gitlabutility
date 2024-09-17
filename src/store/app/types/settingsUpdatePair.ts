import { AppSettings } from ".";

/** Config for update app setting */
export interface SettingsUpdatePair {
    /** Name of key of app settings */
    key: keyof AppSettings;

    /** New setting value */
    value: string | Array<number>;
}

/**
 * Map of pairs: key of application settings to storage record name
 */
export const settingsToStorageKey = new Map<keyof AppSettings, string>([
    ["gitlabAuthToken", "token"],
    ["apiUrl", "api"],

    ["releaseTagNameTemplate", "tagTemplate"],
    ["preloadGroupIds", "favGroups"],
    ["mergeRequestNameTemplate", "mrDefName"],
    ["releaseMergeRequestNameTemplate", "releaseMrDefName"],
]);

/** Reverse of `settingsToStorageKey` */
export const storageKeyToSettingName = new Map([...settingsToStorageKey.entries()].map(([key, value]) => [value, key]))
