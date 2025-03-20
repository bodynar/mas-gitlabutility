import { Actions, ParametrizedAction } from "@app/models";

/** Create branch action parameters */
export type CreateBranchActionConfig = {
    /** Source branch name */
    source: string;

    /** Name of new branch */
    branchName: string;
};

/** Create branch action */
export class CreateBranchAction extends ParametrizedAction<CreateBranchActionConfig> {
    /**
     * Creating an instance of `CreateBranchAction`
     * @param projects Project identifier numbers
     * @param parameters Action configuration
     */
    constructor(
        projects: Array<number>,
        parameters: CreateBranchActionConfig,
    ) {
        super(Actions.createBranch, projects, parameters);
    }
}

/** Parameters for action */
export type CreateBranchParameters = CreateBranchActionConfig;
