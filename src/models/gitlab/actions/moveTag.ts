import { Actions, ParametrizedAction } from "@app/models";

/** Move release tag parameters */
export interface MoveTagActionConfig {
    /** Tag name */
    name: string;

    /** Create tag if tag does not exist */
    createIfNotExist: boolean;
}

/**
 * Move release tag action
 * @description Action used to describe configuration for performing moving tag further on master branch
 */
export class MoveTagAction extends ParametrizedAction<MoveTagActionConfig> {
    /**
     * Creating an instance of `MoveTagAction`
     * @param projects Project identifier numbers
     * @param parameters Move tag parameters
     */
    constructor(
        projects: Array<number>,
        parameters: MoveTagActionConfig,
    ) {
        super(Actions.moveTag, projects, parameters);
    }
}

/** Parameters for move tag action */
export interface MoveTagParameters {
    /** Tag name */
    name: string;

    /** Create tag if tag does not exist */
    createIfNotExist: boolean;
}
