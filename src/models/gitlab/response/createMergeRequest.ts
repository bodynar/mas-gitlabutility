/** Result of creating merge request */
export interface CreateMergeRequestResult {
    /** Created merge request unique identifier (internally in project scope) */
    id: number;

    /** Project identifier */
    projectId: number;

    /** Source branch name */
    source: string;

    /** Target branch name */
    target: string;

    /** Has conflicts, which stops must be solved before merge */
    hasConflicts: boolean;

    /** Link to merge request */
    link: string;

    /** Short ref name */
    ref: string;
}
