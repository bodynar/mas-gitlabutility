import { ActionResult, BaseActionError, RequestAmbiguityData } from "..";

/** Result of performing close merge request action */
export interface CloseMergeRequestActionResult extends ActionResult {
    /** Project identifiers where merge requests was closed */
    closed: Array<number>;

    /** Data about ambiguity branches in project */
    ambiguityItems: Array<RequestAmbiguityData>;

    /** Data about errors */
    errors: Array<CloseMergeRequestError>;
}

/** Close merge request operation error */
export type CloseMergeRequestError = BaseActionError<CloseMergeRequestActionError>;

/** Type of errors that could occurs during merge request close */
export enum CloseMergeRequestActionError {
    /** Error during execution */
    Error = 0,

    /** Merge request not found */
    NotFound = 1,
}
