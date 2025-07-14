import { ActionResult, BaseActionError } from "..";

/** Result of performing check non actual tags action */
export interface CheckNonActualTagsActionResult extends ActionResult {
    /** Projects with actual tags */
    actual: Array<number>;

    /** Information about non actual tags */
    nonActual: Array<NotActualTagInfo>;

    /** Data about errors */
    errors: Array<CheckNonActualTagsActionError>;
}

/** Error during check non actual tags operation */
export type CheckNonActualTagsActionError = BaseActionError<CheckNonActualTagsActionErrorType>;

/** Action performing is cancelled */
export enum CheckNonActualTagsActionErrorType {
    /** Some error caused during operation */
    error = 0,

    /** Branch not found */
    branchNotFound = 1,

    /** Specified tag not found */
    tagNotFound = 2,
}

/** Information about non actual tag */
export interface NotActualTagInfo {
    /** Project identifier */
    projectId: number;

    /** SHA of commit with tag */
    commitSha: string;

    /** Link to commit with tag */
    commitLink: string;

    /** SHA of latest commit on branch */
    latestCommitSha: string;

    /** Link to latest commit on branch */
    latestCommitLink: string;
}
