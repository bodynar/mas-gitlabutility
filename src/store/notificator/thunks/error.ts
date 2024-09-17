import { Action, ThunkAction, ThunkDispatch } from "@reduxjs/toolkit";

import { HttpError } from "@bodynarf/utils/api/simple";

import { NotificationReference } from "@app/models";
import { createError } from "@app/core";

import { GlobalAppState } from "@app/store";
import { ApplicationStatus, setAppStatus } from "@app/store/app";
import { ShowErrorFn, showNotifications } from "@app/store/notificator";

/**
 * Create dispatch-based action to display error message
 * @param dispatch Redux store dispatcher
 * @returns Redux store action displaying error message
 */
export const getDisplayErrorFn = (
    dispatch: ThunkDispatch<GlobalAppState, unknown, Action>
): ShowErrorFn => {
    return (error: Error | string, _?: boolean, removeLoadingState?: boolean, link?: NotificationReference) => {
        let errorMessage = (error as Error)?.message ?? (error as string);

        if (error instanceof HttpError) {
            errorMessage = error.message;
        }

        console.error(errorMessage);

        dispatch(
            showNotifications(
                [createError(errorMessage, link)]
            )
        );

        if (removeLoadingState ?? true) {
            dispatch(setAppStatus(ApplicationStatus.idle));
        }
    };
};

/**
 * Create redux thunk to display error notification
 * @param message Message to display
 * @param removeLoadingState Should app loading state be removed
 * @param link Link configuration
 */
export const displayError = (
    message: string,
    removeLoadingState?: boolean,
    link?: NotificationReference
): ThunkAction<void, GlobalAppState, unknown, Action> => (
    dispatch: ThunkDispatch<GlobalAppState, unknown, Action>): void => {
        const fn = getDisplayErrorFn(dispatch);

        fn(message, undefined, removeLoadingState, link);
    };
