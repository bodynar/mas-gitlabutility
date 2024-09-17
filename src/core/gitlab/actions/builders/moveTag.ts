import { MoveTagAction, MoveTagParameters } from "@app/models";

import { ActionBuilder } from ".";

/**
 * Build move tag action config
 * @param projectIds Array of project identifiers
 * @param parameters Move tag parameters
 * @returns Move tag action configuration
 */
export const buildMoveTagActionConfig: ActionBuilder<MoveTagAction, MoveTagParameters> = (
    projectIds: Array<number>,
    parameters: MoveTagParameters
): MoveTagAction => {
    return new MoveTagAction(
        projectIds,
        { ...parameters },
    );
};
