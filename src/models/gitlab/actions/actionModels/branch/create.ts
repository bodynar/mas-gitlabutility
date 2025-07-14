import { Actions, StateBasedParameters, StateBasedParametrizedAction } from "@app/models";

/** Create branch action parameters */
export type CreateBranchActionConfig = StateBasedParameters & {
    /** Source branch name */
    source: string;

    /** Name of new branch */
    branchName: string;

    /** Save branch as additional branch */
    saveAsAdditionalBranch: boolean;
};

/** Create branch action */
export class CreateBranchAction extends StateBasedParametrizedAction<CreateBranchActionConfig> {
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
