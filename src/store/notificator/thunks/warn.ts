import { Action, ThunkAction, ThunkDispatch } from "@reduxjs/toolkit";

import { NotificationReference } from "@app/models";
import { createWarn } from "@app/core";

import { GlobalAppState } from "@app/store";
import { ShowSimpleMessageFn, showNotifications } from "@app/store/notificator";

/**
 * Create dispatch-based action to display warn message
 * @param dispatch Redux store dispatcher
 * @param getState Function that provides current app global state
 * @returns Redux store action displaying warn message
 */
export const getDisplayWarnFn = (
    dispatch: ThunkDispatch<GlobalAppState, unknown, Action>,
): ShowSimpleMessageFn => {
    return (message: string, important?: boolean, _?: boolean, link?: NotificationReference) => {
        dispatch(
            showNotifications(
                [createWarn(message, important, link)]
            )
        );
    };
};

/**
 * Create redux thunk to display warn notifications
 * @param message Message to display
 * @param important Should message stay on screen until manual user close action
 * @param link Link configuration
 * @returns Redux thunk
 */
export const displayWarn = (message: string, important?: boolean, link?: NotificationReference): ThunkAction<void, GlobalAppState, unknown, Action> =>
    (dispatch: ThunkDispatch<GlobalAppState, unknown, Action>): void => {
        const fn = getDisplayWarnFn(dispatch);

        fn(message, important, undefined, link);
    };
