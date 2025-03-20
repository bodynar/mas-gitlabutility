import { ActionResult, BaseActionError } from "..";

/** Result of performing create branch action */
export interface CreateBranchActionResult extends ActionResult {
    /** Projects with successfully created branch */
    success: Array<number>;

    /** Data about errors */
    errors: Array<CreateBranchActionError>;
}

/** Error during create branch operation */
export type CreateBranchActionError = BaseActionError<CreateBranchActionErrorType>;

/** Categories of createBranch operation errors */
export enum CreateBranchActionErrorType {
    /** Uncategorized error */
    error = 0,

    /** Source branch not found */
    sourceBranchNotFound = 1,

    /** New branch not created */
    notCreated = 2,
}
