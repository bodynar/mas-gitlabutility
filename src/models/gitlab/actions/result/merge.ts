import { MergeResult } from "@app/models";

import { ActionResult } from ".";

/** Result of performing merge action */
export interface MergeActionResult extends ActionResult {
    /** Successfully merged requests data */
    mergedRequests: Array<MergeResult>;

    /** Merge requests, which wasn't merged due some reasons */
    notMergedRequests: Array<NotMergedRequestInfo>;
}

/** Types of reasons why a merge request doesn't fulfill as expected */
export enum NotMergeReasonEnum {
    /** Some error */
    error = 0,

    /** Merge conflicts */
    conflicts = 1,

    /** Current user has no access to branch merge */
    noAccess = 2,

    /** Some of the merging branches were not found */
    noBranches = 10,

    /** Branches doesn't have changes */
    noDiffs = 11,
}

/** Information about merge request that wasn't merged */
export interface NotMergedRequestInfo {
    /** Project identifier */
    projectId: number;

    /** Reason why merge request wasn't merged */
    reason: string;

    /** Classified cause */
    reasonType: NotMergeReasonEnum;

    /** Merge request unique identifier, if it was created */
    id?: number;

    /** Link to merge request */
    link?: string;

    /** Short ref name */
    ref?: string;
}
