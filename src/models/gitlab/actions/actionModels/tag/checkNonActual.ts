import { Actions, ParametrizedAction } from "@app/models";

/** CheckNonActualTags action parameters */
export interface CheckNonActualTagsActionConfig {
    /** Tag name */
    name: string;
}

/** CheckNonActualTags action */
export class CheckNonActualTagsAction extends ParametrizedAction<CheckNonActualTagsActionConfig> {
    /**
     * Creating an instance of `CheckNonActualTagsAction`
     * @param projects Project identifier numbers
     * @param parameters Action parameters
     */
    constructor(
        projects: Array<number>,
        parameters: CheckNonActualTagsActionConfig,
    ) {
        super(Actions.checkNonActualTags, projects, parameters);
    }
}

/** Parameters for check diffs action */
export interface CheckNonActualTagsParameters {
    /** Tag name */
    name: string;
}
