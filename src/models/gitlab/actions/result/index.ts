export * from "./merge";
export * from "./moveTag";
export * from "./release";
export * from "./operationResult";
export * from "./checkDiffs";
export * from "./checkNonActualTags";

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
