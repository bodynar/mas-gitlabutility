import { CoreLocaleKeys } from "@app/core";

import { AppModuleLocaleKeys } from "@app/modules/app/locale.keys";
import { HistoryModuleLocaleKeys } from "@app/locale/keys/history";
import { ManagementModuleLocaleKeys } from "@app/modules/management/locale.keys";
import { NotificationsModuleLocaleKeys } from "@app/modules/notifications/locale.keys";
import { ResultsModuleLocaleKeys } from "@app/modules/results/locale.keys";
import { SettingsModuleLocaleKeys } from "@app/modules/settings/locale.keys";
import { StoreLocaleKeys } from "@app/store";

import { AvailableLocales } from "./types";
import { CommonLocaleKeys, ParametersLocaleKeys, SharedContentLocaleKeys } from "./commonLocale.keys";

import en from "./data/en.json";
import ru from "./data/ru.json";

/** App locale keys structure */
export type LocaleKeysNested = {
    /** Common locale keys */
    common: CommonLocaleKeys;

    /** Core locale keys */
    core: CoreLocaleKeys;

    /** Locale keys for wrapper module */
    app: AppModuleLocaleKeys;

    /** Locale keys for history module */
    history: HistoryModuleLocaleKeys;

    /** Locale keys for history module */
    management: ManagementModuleLocaleKeys;

    /** Locale keys for history module */
    notifications: NotificationsModuleLocaleKeys;

    /** Locale keys for results module */
    results: ResultsModuleLocaleKeys;

    /** Locale keys for settings module */
    settings: SettingsModuleLocaleKeys;

    /** Locale keys for shared content */
    shared: SharedContentLocaleKeys;

    /** Application data storage locale keys */
    store: StoreLocaleKeys;

    /** Action parameters shared locale keys */
    parameters: ParametersLocaleKeys;
};

/**
 * Supported locales with dictionaries
 */
export const localeDictionaries: Map<AvailableLocales, LocaleKeysNested> = new Map([
    [AvailableLocales.en, en],
    [AvailableLocales.ru, ru],
]);
