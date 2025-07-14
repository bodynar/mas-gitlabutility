import { isNullish, isNullOrEmpty } from "@bodynarf/utils";

import { LocaleKeys } from ".";

import { localeDictionaries } from "./internal";
import { defaultLocale, getCurrentLocale } from "./store";

/**
 * Get localized text according to current locale
 * @param key Locale key
 * @returns Localized text
 * @throws {Error} Key is not presented in locale storage
 * @throws {Error} Key is not presented in current locale dictionary
 */
export const getLocalizedText = (key: keyof LocaleKeys): string => {
    let locale = getCurrentLocale();

    if (!localeDictionaries.has(locale)) {
        console.warn(`LOCALE "${locale}" NOT DEFINED IN REGISTERED DICTIONARIES. Using default locale "${defaultLocale}"`);
        locale = defaultLocale;
    }

    const localeDictionary = localeDictionaries.get(locale);

    if (isNullish(localeDictionary)) {
        const currentLocale = getCurrentLocale();

        const message = currentLocale === defaultLocale
            ? `Localized text "${key}" is not presented in locale "${currentLocale}"`
            : `Localized text "${key}" is not presented in current locale "${currentLocale}" and default locale "${defaultLocale}"`;

        throw new Error(message);
    }

    const localized = get(key, localeDictionary);

    if (isNullish(localized)) {
        throw new Error(`Translation for "${key}" in "${locale}" dictionary not found`);
    }

    return localized as string;
};

export { setCurrentLocale } from "./store";

/**
 * Get nested prop value by its path, separated with dot to determine nesting
 * @param path Path to nested prop
 * @param obj Data container
 * @returns Nested prop value or undefined, if prop is not found
 */
const get = (path: string, obj: object): unknown | undefined => {
    if (isNullish(obj) || isNullOrEmpty(path)) {
        return undefined;
    }

    const parts = path.split(".");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = obj;

    for (let index = 0; index < parts.length; index++) {
        if (isNullish(current) || typeof current != "object") {
            return undefined;
        }

        const path = parts[index];

        current = current[path];
    }

    return current;
};

