import { isNullOrEmpty } from "@bodynarf/utils";

/**
 * Get value from persistent storage
 * @param key Storage unique key
 * @returns Value if it was found; otherwise - undefined
 */
const get = <TValue>(key: string): TValue | undefined => {
    if (isNullOrEmpty(key)) {
        return undefined;
    }

    return window.electron.store.get<TValue>(key);
};

/**
 * Save value in persistent storage
 * @param key Storage unique key
 * @param value Value to store
 */
const set = <TValue>(key: string, value: TValue): void => {
    if (isNullOrEmpty(key)) {
        return;
    }

    window.electron.store.set(key, value);
};

/**
 * Check is key presented in storage
 * @param key Storage unique item key
 * @returns `true` if key presented in storage; otherwise - `false`
 */
const has = (key: string): boolean => {
    if (isNullOrEmpty(key)) {
        return false;
    }

    return window.electron.store.has(key);
};

export default {
    get,
    set,
    has,
};
