import { Actions, StateBasedParametrizedAction, StateBasedParameters } from "@app/models";

/** DeleteBranch action parameters */
export type DeleteBranchConfig = StateBasedParameters & {
    /** Branch name */
    branchName: string;

    /** Delete branch from additional branches list after operation */
    deleteBranchFromAdditionalBranches: boolean;
}

/** DeleteBranch action */
export class DeleteBranchAction extends StateBasedParametrizedAction<DeleteBranchConfig> {
    /**
     * Creating an instance of `DeleteBranch`
     * @param projects Project identifier numbers
     * @param parameters Check diffs request parameters
     */
    constructor(
        projects: Array<number>,
        parameters: DeleteBranchConfig,
    ) {
        super(Actions.deleteBranch, projects, parameters);
    }
}

/** Parameters for check diffs action */
export type DeleteBranchParameters = DeleteBranchConfig;
