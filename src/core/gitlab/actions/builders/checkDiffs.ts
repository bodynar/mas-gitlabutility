import { CheckDiffsAction, CheckDiffsParameters } from "@app/models";

import { ActionBuilder } from ".";

/**
 * Build check diffs action config
 * @param projectIds Array of project identifiers
 * @param param1 Check diffs parameters
 * @returns Check diffs action configuration
 */
export const buildCheckDiffsActionConfig: ActionBuilder<CheckDiffsAction, CheckDiffsParameters> = (
    projectIds: Array<number>,
    { source, target }: CheckDiffsParameters
): CheckDiffsAction => {
    return new CheckDiffsAction(
        projectIds,
        {
            source,
            target,
        }
    );
};
