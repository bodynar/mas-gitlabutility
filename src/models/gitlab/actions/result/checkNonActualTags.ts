import { ActionResult } from ".";

/** Result of performing check non actual tags action */
export interface CheckNonActualTagsActionResult extends ActionResult {
    /** Projects with actual tags */
    actual: Array<number>;

    /** Information about non actual tags */
    nonActual: Array<NotActualTagInfo>;

    /** Data about errors */
    errors: Array<[number, string]>;
}

/** Information about non actual tag */
export interface NotActualTagInfo {
    /** Project identifier */
    projectId: number;

    /** SHA of commit with tag */
    commitSha: string;

    /** Link to commit with tag */
    commitLink: string;

    /** SHA of latest commit on master branch */
    latestCommitSha: string;

    /** Link to latest commit on master branch */
    latestCommitLink: string;
}
