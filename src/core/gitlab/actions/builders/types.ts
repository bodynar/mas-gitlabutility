import { Action } from "@app/models";

/**
 * Action builder function
 * @param projectIds Selected projects to use in action
 * @param parameters Action parameters
 */
export type ActionBuilder<TAction extends Action, TParameters> = (
    projectIds: Array<number>,
    parameters: TParameters,
) => TAction;
