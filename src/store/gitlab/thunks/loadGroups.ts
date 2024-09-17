import { Action } from "@reduxjs/toolkit";
import { ThunkAction, ThunkDispatch } from "redux-thunk";

import { isNullOrUndefined } from "@bodynarf/utils";
import { HttpError } from "@bodynarf/utils/api/simple";

import { chainPromises } from "@app/core";
import { getGroups } from "@app/core/gitlab/group";
import { getProjects } from "@app/core/gitlab/project";

import { GlobalAppState } from "@app/store";
import { ApplicationStatus, setAppStatus, transitIntoLoadingState } from "@app/store/app";
import { saveApiInInaccessible, setGroups } from "@app/store/gitlab";
import { getDisplayErrorFn, getNotifications } from "@app/store/notificator";

/**
 * Load all available groups
 * @param concreteGroups Group ids to load with nested projects
 * @param shouldSkipLoadingMode Should loading state be skipped
 */
export const loadGroups = (
    concreteGroups?: Array<number>,
    shouldSkipLoadingMode = false,
): ThunkAction<void, GlobalAppState, unknown, Action> => async (
    dispatch: ThunkDispatch<GlobalAppState, unknown, Action>,
    getState: () => GlobalAppState,
): Promise<void> => {
        if (!shouldSkipLoadingMode) {
            dispatch(transitIntoLoadingState());
        }

        const { gitlab } = getState();

        if (gitlab.apiIsInaccessible === true) {
            dispatch(setAppStatus(ApplicationStatus.idle));
            return;
        }

        const [, showError] = getNotifications(dispatch);

        try {
            let groups = await getGroups();
            dispatch(saveApiInInaccessible(false));

            if (!isNullOrUndefined(concreteGroups) && concreteGroups.length > 0) {
                groups = await chainPromises(
                    groups.map(async group => {
                        if (!concreteGroups.includes(group.id)) {
                            return group;
                        }

                        const projects = await getProjects(group.id);

                        return {
                            ...group,
                            projects: projects,
                            childrenLoaded: true,
                        };
                    })
                );
            }

            dispatch(setGroups(groups));
        } catch (error) {
            dispatch(saveApiInInaccessible(true));

            if (error instanceof HttpError
                && error.message === "TypeError: Failed to fetch"
            ) {
                const errorFn = getDisplayErrorFn(dispatch);

                errorFn("Gitlab is inaccessible");
            }

            showError("Error during groups data load..");
        }

        dispatch(setAppStatus(ApplicationStatus.idle));
    };
