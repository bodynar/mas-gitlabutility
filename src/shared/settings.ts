/**
 * @constant
 * @description Max gitlab version that could be handled by app
 */
export const MAX_GITLAB_VERSION = "13.12.15";

/**
 * @constant
 * @description Keys for settings in persistent storage
 */
export const SETTINGS_STORAGE_KEYS = {
    /** Gitlab auth token */
    TOKEN: "token",

    /** URL of gitlab */
    API_URL: "api",

    /** Tag name template used in release action */
    RELEASE_TAG_TEMPLATE: "tagTemplate",

    /** Group identifiers to load nested projects after app start */
    PRELOAD_GROUP_IDS: "favGroups",

    /** Merge request name template used in stream merge action */
    MERGE_REQUEST_NAME_TEMPLATE: "mrDefName",

    /** Merge request name template used in release action */
    RELEASE_MERGE_REQUEST_NAME_TEMPLATE: "releaseMrDefName",

    /** Is dark theme flag */
    IS_DARK_THEME: "theme",

    /** Show loading state at taskbar flag */
    SHOW_LOADING_STATE_AT_TASKBAR: "loaderInTaskbarState",
};
