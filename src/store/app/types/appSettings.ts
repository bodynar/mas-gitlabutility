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
}

/** Default template settings */
export const defaultTemplateSettings: Map<keyof AppSettings, string> = new Map([
    ["releaseTagNameTemplate", "v"],
    ["mergeRequestNameTemplate", `[Auto] Merge "{0}" into "{1}"`],
    ["releaseMergeRequestNameTemplate", `[Auto] Merge for Release "{0}"`],
]);

/** Array of template values setting names */
export const templateSettings: Array<keyof AppSettings> = Array.from(defaultTemplateSettings.keys());
