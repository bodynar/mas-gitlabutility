import { ReleaseAction, ReleaseParameters } from "@app/models";

import { ActionBuilder } from ".";

/**
 * Build release action config
 * @param projectIds Array of project identifiers
 * @param param1 Release parameters
 * @returns Release action configuration
 */
export const buildReleaseActionConfig: ActionBuilder<ReleaseAction, ReleaseParameters> = (
    projectIds: Array<number>,
    { setVersionTagAfter, version, mergeRequestName }: ReleaseParameters
): ReleaseAction => {
    return new ReleaseAction(
        projectIds,
        {
            mergeRequestName,
            setVersionTagAfter,
            version,
        }
    );
};
