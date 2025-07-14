import { Action, ThunkAction, ThunkDispatch } from "@reduxjs/toolkit";

import { emptyFn, delayResolve } from "@bodynarf/utils";

import { removeHistoryFromStorage } from "@app/core";
import { GlobalAppState } from "@app/store";
import { getNotifications } from "@app/store/notificator";
import { setAppStatus, transitIntoLoadingState, ApplicationStatus, removeHistory, LoadingStateConfig } from "@app/store/app";
import { getLocalizedText } from "@app/locale";

/**
 * Clear app history
 */
export const clearAppHistoryAsync = (
): ThunkAction<Promise<void>, GlobalAppState, unknown, Action> => async (
    dispatch: ThunkDispatch<GlobalAppState, unknown, Action>
): Promise<void> => {
        dispatch(transitIntoLoadingState(
            LoadingStateConfig.basic(
                getLocalizedText("store.app.appHistoryDeleting")
            )
        ));

        await delayResolve(2.5 * 1000, emptyFn);

        removeHistoryFromStorage();

        const [success] = getNotifications(dispatch);

        dispatch(removeHistory());

        dispatch(setAppStatus(ApplicationStatus.idle));
        success("store.app.appHistoryDeleted");
    };
