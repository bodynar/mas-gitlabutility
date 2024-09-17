import { createReducer } from "@reduxjs/toolkit";

import { isNullOrUndefined } from "@bodynarf/utils";

import { GitlabState, addOperationResult, clearSelection, deselectGroup, deselectProject, markThatVersionWarningWasShown, saveApiInInaccessible, selectAll, selectGroup, selectProject, setGroups, setSearchQuery } from ".";

const defaultState: GitlabState = {
    groups: [],
    selectedProjects: [],
    operationsResults: [],
    searchValue: "",
    projects: [],
    versionWarningShown: false,
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
            })
            .addCase(selectAll, state => {
                state.selectedProjects =
                    state.groups.flatMap(({ projects }) => projects.map(({ id }) => id));
            })
            .addCase(clearSelection, state => {
                state.selectedProjects = [];
            })
            .addCase(deselectProject, (state, { payload }) => {
                state.selectedProjects = state.selectedProjects.filter(x => x !== payload);
            })
            .addCase(deselectGroup, (state, { payload }) => {
                const group = state.groups.find(({ id }) => id === payload);

                if (isNullOrUndefined(group)) {
                    return;
                }

                const projectIds = group.projects.map(({ id }) => id);

                state.selectedProjects = state.selectedProjects.filter(x => !projectIds.includes(x));
            })
            .addCase(setSearchQuery, (state, { payload }) => {
                state.searchValue = payload;

                const loweredSearch = payload.toLowerCase();

                state.groups = state.groups.map(x => ({
                    ...x,
                    projects: state.projects
                        .filter(({ groupId, fullName }) => groupId === x.id && fullName.toLowerCase().includes(loweredSearch))
                }));
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
            ;
    }
);
