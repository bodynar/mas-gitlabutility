import { SETTINGS_STORAGE_KEYS } from "@app/shared/settings";

import { AppSettings } from ".";

/** Config for update app setting */
export interface SettingsUpdatePair {
    /** Name of key of app settings */
    key: keyof AppSettings;

    /** New setting value */
    value: string | Array<number> | boolean;
}

/**
 * Map of pairs: key of application settings to storage record name
 */
export const settingsToStorageKey = new Map<keyof AppSettings, string>([
    ["apiUrl", SETTINGS_STORAGE_KEYS.API_URL],
    ["gitlabAuthToken", SETTINGS_STORAGE_KEYS.TOKEN],

    ["releaseTagNameTemplate", SETTINGS_STORAGE_KEYS.RELEASE_TAG_TEMPLATE],
    ["preloadGroupIds", SETTINGS_STORAGE_KEYS.PRELOAD_GROUP_IDS],
    ["mergeRequestNameTemplate", SETTINGS_STORAGE_KEYS.MERGE_REQUEST_NAME_TEMPLATE],
    ["releaseMergeRequestNameTemplate", SETTINGS_STORAGE_KEYS.RELEASE_MERGE_REQUEST_NAME_TEMPLATE],

    ["isDarkTheme", SETTINGS_STORAGE_KEYS.IS_DARK_THEME],
    ["showLoadingStateAtTaskbar", SETTINGS_STORAGE_KEYS.SHOW_LOADING_STATE_AT_TASKBAR],
]);

/** Reverse of `settingsToStorageKey` */
export const storageKeyToSettingName = new Map([...settingsToStorageKey.entries()].map(([key, value]) => [value, key]));
