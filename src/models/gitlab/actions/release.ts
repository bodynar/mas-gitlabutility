import { Actions, ParametrizedAction } from "@app/models";

/** Release action parameters */
export interface ReleaseActionConfig {
    /** Released version */
    version: string;

    /** Is version tag must be set after release merge */
    setVersionTagAfter: boolean;

    /** Name for merge request */
    mergeRequestName: string;
}

/**
 * Release action.
 * @description Action used to describe configuration for performing release merge (usually from to master branch)
 */
export class ReleaseAction extends ParametrizedAction<ReleaseActionConfig> {
    /**
     * Creating an instance of `ReleaseAction`
     * @param projects Project identifier numbers
     * @param parameters Release parameters
     */
    constructor(
        projects: Array<number>,
        parameters: ReleaseActionConfig,
    ) {
        super(Actions.release, projects, parameters);
    }
}

export interface ReleaseParameters {
    /** Name for merge request */
    mergeRequestName: string;

    /** Released version */
    version: string;

    /** Is version tag must be set after release merge */
    setVersionTagAfter: boolean;

    /** Template for MR name */
    template: string;
}
