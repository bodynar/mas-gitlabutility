import { Action } from "@app/models";

/**
 * Action builder function
 * @param projectIds Selected projects to use in action
 * @param parameters Action parameters
 * @param extra Additional action builder parameters from application state values
 */
export type ActionBuilder<TAction extends Action, TParameters> = (
    projectIds: Array<number>,
    parameters: TParameters,
    extra: ActionBuilderAppStateValues
) => TAction;

/** Additional action builder parameters from application state values */
export type ActionBuilderAppStateValues = { // Pick<CommonAppState, "extraBranches">
    /** User configured extra branches */
    extraBranches: Array<string>;
}
