import { Action, ThunkAction, ThunkDispatch } from "@reduxjs/toolkit";

import { emptyFn, delayResolve } from "@bodynarf/utils";

import { saveHistoryToStorage } from "@app/core";
import { GlobalAppState } from "@app/store";
import { getNotifications } from "@app/store/notificator";
import { setAppStatus, transitIntoLoadingState, ApplicationStatus, removeEmptyHistoryEntries, LoadingStateConfig, AppHistory } from "@app/store/app";
import { getLocalizedText } from "@app/locale";
import { appSession } from "@app/shared/values";

/**
 * Clear app session history items with no related data
 * @param sessionMap Session dictionary
 */
export const clearEmptyRecordsAsync = (
    sessionMap: Map<string, {
        notifications: number;
        results: number;
    }>
): ThunkAction<Promise<void>, GlobalAppState, unknown, Action> => async (
    dispatch: ThunkDispatch<GlobalAppState, unknown, Action>,
    getState: () => GlobalAppState
): Promise<void> => {
        dispatch(transitIntoLoadingState(
            LoadingStateConfig.basic(
                getLocalizedText("store.app.appHistoryDeleting")
            )
        ));

        await delayResolve(1.5 * 1000, emptyFn);

        const sessionIdsToRemove = Array
            .from(sessionMap.entries())
            .filter(([sessionId, { notifications, results }]) => notifications === 0 && results === 0 && sessionId !== appSession.id)
            .map(([sessionId]) => sessionId);

        const { app } = getState();

        const updatedHistory: AppHistory = {
            notifications: app.appHistory.notifications.filter(({ sessionId }) => !sessionIdsToRemove.includes(sessionId)),
            results: app.appHistory.results.filter(({ sessionId }) => !sessionIdsToRemove.includes(sessionId)),
            sessions: app.appHistory.sessions.filter(({ id }) => !sessionIdsToRemove.includes(id)),
        };

        saveHistoryToStorage(updatedHistory, {
            notifications: [],
            results: [],
            sessions: []
        });

        const [success] = getNotifications(dispatch);

        dispatch(removeEmptyHistoryEntries(sessionIdsToRemove));

        dispatch(setAppStatus(ApplicationStatus.idle));
        success("store.app.emptyHistoryRecordsDeleted");
    };
