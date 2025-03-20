import { Actions, ParametrizedAction } from "@app/models";

/** CloseMergeRequest action parameters */
export type CloseMergeRequestConfig = {
    /** Merge request name */
    requestName: string;

    /** Remove source branch after */
    removeBranch: boolean;
}

/** CloseMergeRequest action */
export class CloseMergeRequestAction extends ParametrizedAction<CloseMergeRequestConfig> {
    /**
     * Creating an instance of `CloseMergeRequest`
     * @param projects Project identifier numbers
     * @param parameters Check diffs request parameters
     */
    constructor(
        projects: Array<number>,
        parameters: CloseMergeRequestConfig,
    ) {
        super(Actions.closeMergeRequest, projects, parameters);
    }
}

/** Parameters for check diffs action */
export type CloseMergeRequestParameters = CloseMergeRequestConfig;
