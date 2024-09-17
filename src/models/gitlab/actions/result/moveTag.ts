import { ActionResult } from ".";

/** Result of performing move release tag action */
export interface MoveTagActionResult extends ActionResult {
    /** Information about moved tags */
    movedTags: Array<MovedTagInfo>;

    /** Information about tags, which was not found */
    notMovedTags: Array<NotMovedTagInfo>;
}

/** Information about moved tag */
export interface MovedTagInfo {
    /** Project identifier */
    projectId: number;

    /** Link to project or tag, depending on type */
    link?: string;

    /** Commit SHA */
    sha?: string;
}

/** Information about not moved tag */
export interface NotMovedTagInfo extends MovedTagInfo {
    /** Why tag wasn't moved */
    reason: string;

    /** Categorized reason */
    reasonType: NotMovedTagReason;
}

/** Action performing is cancelled */
export enum NotMovedTagReason {
    /** Some error caused during operation */
    error = 0,

    /** Master branch not found */
    branchNotFound = 1,

    /** Specified tag not found */
    tagNotFound = 2,

    /** Tag is on a last commit */
    tagIsUpToDate = 3,
}
