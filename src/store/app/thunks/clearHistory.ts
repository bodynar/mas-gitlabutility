import { Action, ThunkAction, ThunkDispatch } from "@reduxjs/toolkit";

import { GlobalAppState } from "@app/store";
import { setAppStatus, transitIntoLoadingState, ApplicationStatus, removeHistory, LoadingStateConfig } from "..";
import { removeHistoryFromStorage } from "@app/core";
import { emptyFn, delayResolve } from "@bodynarf/utils";
import { getNotifications } from "@app/store/notificator";

/**
 * Clear app history
 */
export const clearAppHistoryAsync = (
): ThunkAction<Promise<void>, GlobalAppState, unknown, Action> => async (
    dispatch: ThunkDispatch<GlobalAppState, unknown, Action>
): Promise<void> => {
        dispatch(transitIntoLoadingState(
            LoadingStateConfig.basic("Deleting app history")
        ));

        await delayResolve(2.5 * 1000, emptyFn);

        removeHistoryFromStorage();

        const [success] = getNotifications(dispatch);

        dispatch(removeHistory());

        dispatch(setAppStatus(ApplicationStatus.idle));
        success("App history successfully deleted");
    };
