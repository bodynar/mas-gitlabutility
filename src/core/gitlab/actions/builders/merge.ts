import { MergeAction, MergeParameters } from "@app/models";

import { ActionBuilder } from ".";

/**
 * Build merge action config
 * @param projectIds Array of project identifiers
 * @param param1 Merge parameters
 * @returns Merge action configuration
 */
export const buildMergeActionConfig: ActionBuilder<MergeAction, MergeParameters> = (
    projectIds: Array<number>,
    { sourceBranch, targetBranch, name }: MergeParameters
): MergeAction => {
    return new MergeAction(
        projectIds,
        {
            name,
            source: sourceBranch,
            target: targetBranch,
        }
    );
};
