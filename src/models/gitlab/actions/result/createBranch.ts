import { ActionResult } from ".";

/** Result of performing create branch action */
export interface CreateBranchActionResult extends ActionResult {
    /** Projects with successfully created branch */
    success: Array<number>;

    /**
     * Data about errors
     *
     * Pairs of [Project identifier, error]
     */
    errors: Array<[number, string]>;
}
