import { isNullOrEmpty } from "@bodynarf/utils";
import { AvailableLocales } from ".";

/** Fallback locale */
export const defaultLocale: AvailableLocales = AvailableLocales["ru"];

/** Current locale */
let currentLocale: AvailableLocales = defaultLocale;

/**
 * Get current locale
 * @returns Locale key
 */
export const getCurrentLocale = (): AvailableLocales => currentLocale;

/**
 * Set active locale
 * @param locale Locale key
 */
export const setCurrentLocale = (locale: string) => {
    if (isNullOrEmpty(locale)) {
        return;
    }

    const keys = Object.keys(AvailableLocales);

    if (!keys.includes(locale)) {
        return;
    }

    currentLocale = AvailableLocales[locale as keyof typeof AvailableLocales];
};
