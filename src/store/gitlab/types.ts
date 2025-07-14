import { ActionResult, Group, OperationResult, Project, ProjectViewMode } from "@app/models";

/** Gitlab integration state */
export interface GitlabState {
    /** Current gitlab api is inaccessible */
    apiIsInaccessible?: boolean;

    /** Available groups */
    groups: Array<Group>;

    /** All projects */
    projects: Array<Project>;

    /** Project identifiers selected for performing action */
    selectedProjects: Array<number>;

    /** Results of the operations performed */
    operationsResults: Array<OperationResult<ActionResult>>;

    /** Current search query */
    searchValue: string;

    /** Warning about outdated version shown */
    versionWarningShown: boolean;

    /** Identifier of current view mode for selectable projects component */
    currentProjectViewMode: ProjectViewMode;
}
