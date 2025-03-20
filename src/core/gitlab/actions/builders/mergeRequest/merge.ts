import { MergeRequestAction, MergeRequestParameters } from "@app/models";

import { ActionBuilder } from "..";

/**
 * Build MergeRequest action config
 * @param projectIds Array of project identifiers
 * @param param1 MergeRequest action parameters
 * @returns MergeRequest action configuration
 */
export const buildMergeRequestActionConfig: ActionBuilder<MergeRequestAction, MergeRequestParameters> = (
    projectIds: Array<number>,
    { requestName, removeBranch }: MergeRequestParameters
): MergeRequestAction => {
    return new MergeRequestAction(
        projectIds,
        {
            requestName, removeBranch
        }
    );
};
