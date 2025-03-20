import { DeleteBranchAction, DeleteBranchParameters } from "@app/models";

import { ActionBuilder } from "..";

/**
 * Build DeleteBranch action config
 * @param projectIds Array of project identifiers
 * @param param1 DeleteBranch action parameters
 * @returns DeleteBranch action configuration
 */
export const buildDeleteBranchActionConfig: ActionBuilder<DeleteBranchAction, DeleteBranchParameters> = (
    projectIds: Array<number>,
    { branchName }: DeleteBranchParameters
): DeleteBranchAction => {
    return new DeleteBranchAction(
        projectIds,
        {
            branchName
        }
    );
};
