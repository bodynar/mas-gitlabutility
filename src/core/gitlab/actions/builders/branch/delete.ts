import { DeleteBranchAction, DeleteBranchParameters } from "@app/models";

import { ActionBuilder, ActionBuilderAppStateValues } from "..";

/**
 * Build DeleteBranch action config
 * @param projectIds Array of project identifiers
 * @param parameters DeleteBranch action parameters
 * @param extra Additional action builder parameters from application state values
 * @returns DeleteBranch action configuration
 */
export const buildDeleteBranchActionConfig: ActionBuilder<DeleteBranchAction, DeleteBranchParameters> = (
    projectIds: Array<number>,
    { branchName, deleteBranchFromAdditionalBranches }: DeleteBranchParameters,
    { extraBranches }: ActionBuilderAppStateValues
): DeleteBranchAction => {
    return new DeleteBranchAction(
        projectIds,
        {
            branchName, deleteBranchFromAdditionalBranches, extraBranches
        }
    );
};
