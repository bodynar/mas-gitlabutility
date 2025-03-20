import { CreateMergeRequestResult } from ".";

/** Result of creating merge request */
export interface MergeResult extends Omit<CreateMergeRequestResult, "source" | "target"> {
    /** SHA of merge commit */
    mergeCommitSha: string;
}
