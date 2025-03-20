import { CloseMergeRequestAction, CloseMergeRequestParameters } from "@app/models";

import { ActionBuilder } from "..";

/**
 * Build CloseMergeRequest action config
 * @param projectIds Array of project identifiers
 * @param param1 CloseMergeRequest action parameters
 * @returns CloseMergeRequest action configuration
 */
export const buildCloseMergeRequestActionConfig: ActionBuilder<CloseMergeRequestAction, CloseMergeRequestParameters> = (
    projectIds: Array<number>,
    { requestName, removeBranch }: CloseMergeRequestParameters
): CloseMergeRequestAction => {
    return new CloseMergeRequestAction(
        projectIds,
        {
            requestName, removeBranch
        }
    );
};
