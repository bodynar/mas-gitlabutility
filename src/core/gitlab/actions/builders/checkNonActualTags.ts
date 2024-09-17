import { CheckNonActualTagsAction, CheckNonActualTagsParameters } from "@app/models";

import { ActionBuilder } from ".";

/**
 * Build check diffs action config
 * @param projectIds Array of project identifiers
 * @param param1 Check non actual tags parameters
 * @returns Check non actual tags action configuration
 */
export const buildCheckNonActualTagsActionConfig: ActionBuilder<CheckNonActualTagsAction, CheckNonActualTagsParameters> = (
    projectIds: Array<number>,
    { name }: CheckNonActualTagsParameters
): CheckNonActualTagsAction => {
    return new CheckNonActualTagsAction(
        projectIds,
        {
            name
        }
    );
};
