import { Action, ThunkAction, ThunkDispatch } from "@reduxjs/toolkit";

import { NotificationReference } from "@app/models";
import { createSuccess } from "@app/core";

import { GlobalAppState } from "@app/store";
import { ApplicationStatus, setAppStatus } from "@app/store/app";
import { ShowSimpleMessageFn, showNotifications } from "@app/store/notificator";

/**
 * Create dispatch-based action to display success message
 * @param dispatch Redux store dispatcher
 * @returns Redux store action displaying success message
 */
export const getDisplaySuccessFn = (
    dispatch: ThunkDispatch<GlobalAppState, unknown, Action>
): ShowSimpleMessageFn => {
    return (message: string, important?: boolean, removeLoadingState?: boolean, link?: NotificationReference) => {
        dispatch(
            showNotifications(
                [createSuccess(message, important ?? false, link)]
            )
        );

        if (removeLoadingState ?? true) {
            dispatch(setAppStatus(ApplicationStatus.idle));
        }
    };
};

/**
 * Create redux thunk to display success notification
 * @param message Message to display
 * @param important Should message stay on screen until manual user close action
 * @param removeLoadingState Should app loading state be removed
 * @param link Link configuration
 */
export const displaySuccess = (
    message: string,
    important?: boolean,
    removeLoadingState?: boolean,
    link?: NotificationReference
): ThunkAction<void, GlobalAppState, unknown, Action> => (
    dispatch: ThunkDispatch<GlobalAppState, unknown, Action>): void => {
        const fn = getDisplaySuccessFn(dispatch);

        fn(message, important, removeLoadingState, link);
    };

