import { CreateBranchAction, CreateBranchParameters } from "@app/models";

import { ActionBuilder } from "..";

/**
 * Build CreateBranch action config
 * @param projectIds Array of project identifiers
 * @param param1 CreateBranch action parameters
 * @returns CreateBranch action configuration
 */
export const buildCreateBranchActionConfig: ActionBuilder<CreateBranchAction, CreateBranchParameters> = (
    projectIds: Array<number>,
    { branchName, source }: CreateBranchParameters
): CreateBranchAction => {
    return new CreateBranchAction(
        projectIds,
        {
            branchName, source
        }
    );
};
