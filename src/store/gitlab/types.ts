import { Group, OperationResult, Project } from "@app/models";

/** Gitlab integration state */
export interface GitlabState {
    /** Current gitlab api url is inaccessible */
    apiIsInaccessible?: boolean;

    /** Available groups */
    groups: Array<Group>;

    /** All projects */
    projects: Array<Project>;

    /** Project identifiers selected for performing action */
    selectedProjects: Array<number>;

    /** Results of the operations performed */
    operationsResults: Array<OperationResult<any>>;

    /** Current search query */
    searchValue: string;

    /** Warning about outdated version shown */
    versionWarningShown: boolean;
}
