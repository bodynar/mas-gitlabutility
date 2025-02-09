import { Actions, ParametrizedAction } from "@app/models";

/** Merge action parameters */
export interface MergeActionConfig {
    /** Source branch name */
    source: string; // todo: now it's string

    /** Target branch name */
    target: string;

    /** Merge request name */
    name: string;
}

/** Merge action */
export class MergeAction extends ParametrizedAction<MergeActionConfig> {
    /**
     * Creating an instance of `MergeAction`
     * @param projects Project identifier numbers
     * @param parameters Merge request parameters
     */
    constructor(
        projects: Array<number>,
        parameters: MergeActionConfig,
    ) {
        super(Actions.merge, projects, parameters);
    }
}

/** Parameters for merge action */
export interface MergeParameters {
    /** Name for merge request */
    name: string;

    /** Name of branch which should be merged from */
    sourceBranch: string;

    /** Name of branch which should be merged to */
    targetBranch: string;

    /** Template for name */
    template: string;
}
