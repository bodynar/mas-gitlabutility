import { ActionResult } from ".";

/** Result of performing check diffs action */
export interface CheckDiffsActionResult extends ActionResult {
    /** Project identifiers with diff between branches */
    hasDiffs: Array<number>;

    /** Project identifiers without diff between branches */
    noDiffs: Array<number>;

    /** Data about errors */
    errors: Array<[number, string]>;
}

