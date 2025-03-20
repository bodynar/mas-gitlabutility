import { ActionResult, BaseActionError, RequestAmbiguityData } from "..";

/** Result of performing merge request action */
export interface MergeRequestActionResult extends ActionResult {
    /** Project identifiers where merge requests was merged */
    merged: Array<number>;

    /** Data about ambiguity branches in project */
    ambiguityItems: Array<RequestAmbiguityData>;

    /** Data about errors */
    errors: Array<MergeRequestError>;
}

/** Merge request operation error */
export type MergeRequestError = BaseActionError<MergeRequestActionError>;

/** Type of errors that could occurs during merge request */
export enum MergeRequestActionError {
    /** Error during execution */
    Error = 0,

    /** Merge request not found */
    NotFound = 1,
}
