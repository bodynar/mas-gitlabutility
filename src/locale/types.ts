import { LocaleKeysNested } from "./internal";

/** Available languages */
export enum AvailableLocales {
    /** English language */
    en = "en",

    /** Russian language */
    ru = "ru",
}

/** Available locale keys */
export type LocaleKeys = FlattenedLocaleObject<LocaleKeysNested>;

// #region

type DotPrefix<T extends string, U extends string> =
    T extends "" ? U : `${T}.${U}`;

type FlattenWithPrefix<T, Prefix extends string = ""> =
    T extends string
    ? { [K in Prefix]: T }
    : {
        [K in keyof T]: FlattenWithPrefix<T[K], DotPrefix<Prefix, Extract<K, string>>>
    }[keyof T];

type UnionToIntersection<U> =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (U extends any ? (k: U) => void : never) extends
    (k: infer I) => void ? I : never;

type Merge<T> = {
    [K in keyof T]: T[K];
};

type FlattenedLocaleObject<T> = Merge<UnionToIntersection<FlattenWithPrefix<T>>>;

// #endregion
