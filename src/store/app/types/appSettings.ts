import { getLocalizedText } from "@app/locale";

/** Application settings */
export type AppSettings = {
    /** Current gitlab auth token */
    gitlabAuthToken: string;

    /** Gitlab site url */
    apiUrl: string;

    /** Release tag name template */
    releaseTagNameTemplate: string;

    /** Group ids to preload nested projects */
    preloadGroupIds: Array<number>;

    /** Default name for merge request during merge action */
    mergeRequestNameTemplate: string;

    /** Default name for merge request during release action */
    releaseMergeRequestNameTemplate: string;

    /** Is dark theme applied */
    isDarkTheme: boolean;

    /** Display loading state on task bar */
    showLoadingStateAtTaskbar: boolean;
}

/** Default template settings */
export const defaultTemplateSettings: Map<keyof AppSettings, string> = new Map([
    ["releaseTagNameTemplate", "v"],
    ["mergeRequestNameTemplate", getLocalizedText("store.app.mergeRequestNameTemplate")],
    ["releaseMergeRequestNameTemplate", getLocalizedText("store.app.releaseMergeRequestNameTemplate")],
]);

/** Array of template values setting names */
export const templateSettings: Array<keyof AppSettings> = Array.from(defaultTemplateSettings.keys());
