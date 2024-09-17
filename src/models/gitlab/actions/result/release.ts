import { MergeActionResult } from ".";

/** Result of performing release action */
export interface ReleaseActionResult extends MergeActionResult {
    /** Information about created tags */
    createdTags: Array<TagResult>;
}

/** Result of creating tag */
export interface TagResult {
    /** Project identifier */
    projectId: number;

    /** Name */
    name: string;

    /** Link to commit with release tag */
    link: string;

    /**
     * Project has no release changes.
     * No MR created, just marked with a tag
     */
    markOnly: boolean;
}
