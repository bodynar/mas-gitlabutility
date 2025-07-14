import { Actions, ParametrizedAction } from "@app/models";

/** CheckDiffs action parameters */
export interface CheckDiffsActionConfig {
    /** Source branch name */
    source: string;

    /** Target branch name */
    target: string;
}

/** CheckDiffs action */
export class CheckDiffsAction extends ParametrizedAction<CheckDiffsActionConfig> {
    /**
     * Creating an instance of `CheckDiffsAction`
     * @param projects Project identifier numbers
     * @param parameters Check diffs request parameters
     */
    constructor(
        projects: Array<number>,
        parameters: CheckDiffsActionConfig,
    ) {
        super(Actions.checkDiffs, projects, parameters);
    }
}

/** Parameters for check diffs action */
export interface CheckDiffsParameters {
    /** Source branch name */
    source: string;

    /** Target branch name */
    target: string;
}
