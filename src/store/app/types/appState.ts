import { ApplicationStatus, AppSettings, LoadingStateConfig } from ".";

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
}
