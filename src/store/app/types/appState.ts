import { ApplicationStatus, AppSettings, LoadingStateConfig, AppHistory } from ".";

/** Application shared state */
export type CommonAppState = {
    /** Current application status */
    status: ApplicationStatus;

    /** Application settings */
    settings: AppSettings;

    /** Previous values of application settings */
    previousSettings?: AppSettings;

    /** Current loading state overlay configuration */
    loadingStateConfig?: LoadingStateConfig;

    /** History of app */
    appHistory: AppHistory;

    /** User configured extra branches */
    extraBranches: Array<string>;
}
