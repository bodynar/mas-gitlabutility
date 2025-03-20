import { Actions, ParametrizedAction } from "@app/models";

/** DeleteBranch action parameters */
export type DeleteBranchConfig = {
    /** Branch name */
    branchName: string;
}

/** DeleteBranch action */
export class DeleteBranchAction extends ParametrizedAction<DeleteBranchConfig> {
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
