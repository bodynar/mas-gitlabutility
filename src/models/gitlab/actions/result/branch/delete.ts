import { ActionResult, BaseActionError } from "..";

/** Result of performing remove branch action */
export interface DeleteBranchActionResult extends ActionResult {
    /** Project identifiers where specific branch were deleted */
    deleted: Array<number>;

    /** Data about ambiguity branches in project */
    ambiguityItems: Array<BranchAmbiguityData>;

    /** Data about errors  */
    errors: Array<DeleteBranchError>;
}

/** Error during delete branch operation */
export type DeleteBranchError = BaseActionError<DeleteBranchErrorType>;

/** Delete branch errors */
export enum DeleteBranchErrorType {
    /** Some error caused during operation */
    error = 0,

    /** Branch not found */
    branchNotFound = 1,
}

/** Data about ambiguity branches in project */
export type BranchAmbiguityData = {
    /** Project identifier */
    projectId: number;

    /** Amount of branches that satisfies search */
    branchesCount: number;
};
