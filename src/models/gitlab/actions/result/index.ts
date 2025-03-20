export * from "./operationResult";
export * from "./baseActionError";

export * from "./branch";
export * from "./mergeRequest";
export * from "./streamMerge";
export * from "./tag";

/** Baseline for gitlab actions result */
export interface ActionResult {
    /** Status of action */
    status: ActionResultState;
}

/** Enumeration of possible action result state */
export enum ActionResultState {
    /** Everything is ok */
    success,

    /** There's some error and success results */
    warn,

    /** There's some error and no success results */
    error,

    /** Operation was terminated by user */
    cancelled
}
