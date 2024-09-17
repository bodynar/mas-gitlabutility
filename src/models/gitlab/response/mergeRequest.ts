export enum DefaultBranch {
    Develop = "develop",

    Test = "test",

    Master = "master",
}

/** List of default branches */
export const DEFAULT_BRANCHES = [
    DefaultBranch.Develop,
    DefaultBranch.Test,
    DefaultBranch.Master,
];

/** Merge request merge state */
export type MergeRequestState =
    /** Merge request is in awaiting for decision */
    | "opened"

    /** Merge is closed, no changes were merged */
    | "closed"

    /** Merge is completed, branches were merged */
    | "merged"
    ;

/** Merge request */
export interface MergeRequest {
    /** Unique identifier in project scope */
    id: number;

    /** Parent project identifier */
    projectId: number;

    /** Unique identifier across all scopes (global) */
    globalId: number;

    /** Displayable title */
    title: string;

    /** Short ref name */
    ref: string;

    /** Source branch (where to take changes) */
    sourceBranch: string;

    /** Target branch (where to put changes) */
    targetBranch: string;

    /** Applied labels */
    labels: Array<string>;

    /** Is request in work in progress state */
    draft: boolean;

    /** Is request has conflicts, which disallows to merge */
    hasConflicts: boolean;

    /** Url to merge request */
    link: string;

    /** Current request state */
    state: MergeRequestState;

    /**
     * Merge branches state
     * @description Difference between `state` and `status`: State represents common entity state (see `MergeRequestState`)
     * and status represents merge changes state
     */
    status: string;

    /** Sha of latest commit in source branch */
    fromCommitSha: string;

    /** Is current user can merge */
    canBeMergedByCurrentUser: boolean;

    /** Current merge error */
    mergeError?: string;
}
