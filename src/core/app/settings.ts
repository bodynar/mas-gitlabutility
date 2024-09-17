import { isNullOrEmpty, isNullOrUndefined } from "@bodynarf/utils";

import storage from "@app/core/storage";

import { AppSettings, SettingsUpdatePair, defaultTemplateSettings, settingsToStorageKey, storageKeyToSettingName } from "@app/store/app";

/**
 * Load setting values from app storage
 * @param useDefaultValue Should default value be used when setting value is empty
 * @returns Array of setting values
 */
export const getSettingsFromStorage = (useDefaultValue = false): Array<SettingsUpdatePair> => {
    const result: Array<SettingsUpdatePair> = [];

    settingsToStorageKey.forEach((storageKey: keyof AppSettings, settingKey) => {
        let storageValue = storage.get<string>(storageKey);

        if (isNullOrEmpty(storageValue) && useDefaultValue) {
            if (storageKeyToSettingName.has(storageKey)) {
                const settingKey = storageKeyToSettingName.get(storageKey);

                if (defaultTemplateSettings.has(settingKey)) {
                    storageValue = defaultTemplateSettings.get(settingKey);
                }
            }
        }

        result.push({
            key: settingKey,
            value: storageValue ?? (settingKey === "preloadGroupIds" ? [] : ""),
        });
    });

    return result;
};

/**
 * Get changed settings
 * @param current Current application settings values
 * @param previous Previous application settings values
 * @returns Array of changed settings
 */
export const getDiff = (current: AppSettings, previous?: AppSettings): Array<SettingsUpdatePair> => {
    if (isNullOrUndefined(current) || isNullOrUndefined(previous)) {
        return [];
    }

    const result: Array<SettingsUpdatePair> = [];

    for (const key in current) {
        if (!Object.prototype.hasOwnProperty.call(current, key)
            || !Object.prototype.hasOwnProperty.call(previous, key)
        ) {
            continue;
        }

        const currentValue = current[key as keyof AppSettings];
        const previousValue = previous[key as keyof AppSettings];

        if (currentValue !== previousValue) {
            result.push({
                key: key as keyof AppSettings,
                value: currentValue,
            });
        }
    }

    return result;
};

/**
 * Check is there any template settings
 * @param current Current template settings
 * @returns `true` if template settings have been changed.; otherwise - `false`
 */
export const checkHasTemplateDiff = (current: AppSettings): boolean => {
    if (isNullOrUndefined(current)) {
        return false;
    }

    for (const [key, value] of defaultTemplateSettings) {
        if (value !== current[key]) {
            return true;
        }
    }

    return false;
};

/**
 * Save settings to storage
 * @param settings Settings to save
 */
export const saveSettingsToStorage = (settings: Array<SettingsUpdatePair>): void => {
    settings.forEach(({ key, value }) => {
        const storageKey = settingsToStorageKey.get(key);

        const currentStorageValue = storage.get(storageKey);

        if (currentStorageValue === value) {
            return;
        }

        storage.set(storageKey, value);
    });
};

/**
 * Check is all app settings configured
 * @param appSettings Application settings data
 * @returns `true` if all settings configured properly; otherwise - `false`
 */
export const getIsAppConfigured = (appSettings: AppSettings): boolean => {
    const result = ![
        appSettings.apiUrl, appSettings.gitlabAuthToken,
    ].some(x => isNullOrEmpty(x));

    return result;
};

/**
 * Check is initial app run.
 * On initial app run storage is empty (does not contain any keys)
 * @returns `true` if storage does not contain any settings; otherwise - `false`
 */
export const checkHasStorage = (): boolean => {
    const keys = [...storageKeyToSettingName.keys()];

    for (let index = 0; index < keys.length; index++) {
        const key = keys[index];

        const isKeyPresentedInStore = storage.has(key);

        if (isKeyPresentedInStore) {
            return true;
        }
    }

    return false;
};
