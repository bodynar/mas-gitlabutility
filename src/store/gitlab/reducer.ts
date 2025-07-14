import { createReducer } from "@reduxjs/toolkit";

import moment from "moment";

import { isNullish, isNullOrUndefined } from "@bodynarf/utils";

import { appSession, projectsViewMode } from "@app/shared/values";
import { Group, Project, ProjectViewMode } from "@app/models";

import { GitlabState, addOperationResult, changeProjectsViewMode, clearSelection, deselectGroup, deselectProject, markThatVersionWarningWasShown, saveApiInInaccessible, selectAll, selectGroup, selectProject, setGroups, setSearchQuery } from ".";
import { initHistory, removeHistory } from "../app";

const defaultState: GitlabState = {
    groups: [],
    selectedProjects: [],
    operationsResults: [],
    searchValue: "",
    projects: [],
    versionWarningShown: false,
    currentProjectViewMode: projectsViewMode[0].value as ProjectViewMode,
};

/** Gitlab integration state reducer */
export const reducer = createReducer(defaultState,
    (builder) => {
        builder
            .addCase(setGroups, (state, { payload }) => {
                state.groups = payload;

                state.projects = payload.flatMap(({ projects }) => projects);
            })
            .addCase(addOperationResult, (state, { payload }) => {
                const duplicateIndex = state.operationsResults.findIndex(({ id }) => id === payload.id);

                if (duplicateIndex === -1) {
                    state.operationsResults.push(payload);
                    return;
                }

                state.operationsResults[duplicateIndex] = {
                    ...state.operationsResults[duplicateIndex],
                    ...payload,
                };
            })
            .addCase(selectProject, (state, { payload }) => {
                state.selectedProjects =
                    state.selectedProjects
                        .concat(payload)
                        .filter((x, i, a) => a.indexOf(x) === i)
                    ;

                state.groups = filterProjectsByViewMode(
                    state.currentProjectViewMode,
                    state.searchValue,
                    state.groups,
                    state.projects,
                    state.selectedProjects
                );
            })
            .addCase(selectGroup, (state, { payload }) => {
                const group = state.groups.find(({ id }) => id === payload);

                if (isNullOrUndefined(group)) {
                    return;
                }

                state.selectedProjects =
                    state.selectedProjects.concat(
                        group.projects.map(({ id }) => id)
                    )
                        .filter((x, i, a) => a.indexOf(x) === i);

                state.groups = filterProjectsByViewMode(
                    state.currentProjectViewMode,
                    state.searchValue,
                    state.groups,
                    state.projects,
                    state.selectedProjects
                );
            })
            .addCase(selectAll, state => {
                state.selectedProjects =
                    state.projects.map(({ id }) => id);

                state.groups = filterProjectsByViewMode(
                    state.currentProjectViewMode,
                    state.searchValue,
                    state.groups,
                    state.projects,
                    state.selectedProjects
                );
            })
            .addCase(clearSelection, state => {
                state.selectedProjects = [];

                state.groups = filterProjectsByViewMode(
                    state.currentProjectViewMode,
                    state.searchValue,
                    state.groups,
                    state.projects,
                    state.selectedProjects
                );
            })
            .addCase(deselectProject, (state, { payload }) => {
                state.selectedProjects = state.selectedProjects.filter(x => x !== payload);

                state.groups = filterProjectsByViewMode(
                    state.currentProjectViewMode,
                    state.searchValue,
                    state.groups,
                    state.projects,
                    state.selectedProjects
                );
            })
            .addCase(deselectGroup, (state, { payload }) => {
                const group = state.groups.find(({ id }) => id === payload);

                if (isNullOrUndefined(group)) {
                    return;
                }

                const projectIds = group.projects.map(({ id }) => id);

                state.selectedProjects = state.selectedProjects.filter(x => !projectIds.includes(x));

                state.groups = filterProjectsByViewMode(
                    state.currentProjectViewMode,
                    state.searchValue,
                    state.groups,
                    state.projects,
                    state.selectedProjects
                );
            })
            .addCase(setSearchQuery, (state, { payload }) => {
                state.searchValue = payload;

                state.groups = filterProjectsByViewMode(
                    state.currentProjectViewMode,
                    payload,
                    state.groups,
                    state.projects,
                    state.selectedProjects
                );
            })
            .addCase(markThatVersionWarningWasShown, (state) => {
                state.versionWarningShown = true;
            })
            .addCase(saveApiInInaccessible, (state, { payload }) => {
                state.apiIsInaccessible = payload;

                if (payload) {
                    state.groups = [];
                    state.projects = [];
                }
            })
            .addCase(initHistory, (state, { payload }) => {
                state.operationsResults.push(
                    ...payload.results
                        .map(x => ({
                            ...x,
                            createdOn: moment(x.createdOn),
                            startedOn: moment(x.startedOn),
                            completedOn: isNullish(x.completedOn) ? null : moment(x.completedOn)
                        }))
                );
            })
            .addCase(removeHistory, (state) => {
                state.operationsResults = state.operationsResults.filter(({ sessionId }) => sessionId === appSession.id);
            })
            .addCase(changeProjectsViewMode, (state, { payload }) => {
                if (state.currentProjectViewMode === payload) {
                    return;
                }

                state.currentProjectViewMode = payload;

                state.groups = filterProjectsByViewMode(
                    payload,
                    state.searchValue,
                    state.groups,
                    state.projects,
                    state.selectedProjects
                );
            })
            ;
    }
);

const filterProjectsByViewMode = (
    mode: ProjectViewMode,
    searchQuery: string,
    groups: Array<Group>,
    projects: Array<Project>,
    selectedProjects: Array<number>
) => {
    const loweredSearch = searchQuery.toLowerCase();

    let predicate: (x: Project) => boolean =
        () => true;

    switch (mode) {
        case ProjectViewMode.All:
            break;
        case ProjectViewMode.OnlySelected:
            predicate = ({ id }) => selectedProjects.includes(id);
            break;
        case ProjectViewMode.OnlyDeselected:
            predicate = ({ id }) => !selectedProjects.includes(id);
            break;

        default:
            break;
    }

    return groups.map(x => ({
        ...x,
        projects: projects
            .filter(({ groupId }) => groupId === x.id)
            .filter(({ fullName }) => fullName.toLowerCase().includes(loweredSearch))
            .filter(predicate)
    }));
};
