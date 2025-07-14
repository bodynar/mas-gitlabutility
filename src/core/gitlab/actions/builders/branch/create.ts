import { CreateBranchAction, CreateBranchParameters } from "@app/models";

import { ActionBuilder, ActionBuilderAppStateValues } from "..";

/**
 * Build CreateBranch action config
 * @param projectIds Array of project identifiers
 * @param parameters CreateBranch action parameters
 * @param extra Additional action builder parameters from application state values
 * @returns CreateBranch action configuration
 */
export const buildCreateBranchActionConfig: ActionBuilder<CreateBranchAction, CreateBranchParameters> = (
    projectIds: Array<number>,
    { branchName, source, saveAsAdditionalBranch }: CreateBranchParameters,
    { extraBranches }: ActionBuilderAppStateValues
): CreateBranchAction => {
    return new CreateBranchAction(
        projectIds,
        {
            branchName, source, saveAsAdditionalBranch,
            extraBranches
        }
    );
};
