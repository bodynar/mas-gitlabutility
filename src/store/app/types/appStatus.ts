/** Application current state */
export const enum ApplicationStatus {
    /** Application is in init stage */
    init,

    /** Application is in after init stage */
    afterInit,

    /** Application is loading something */
    loading,

    /** Application is idle & awaiting for user action */
    idle,

    /** Something bad happened in application */
    error,
}
