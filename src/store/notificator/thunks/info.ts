import { Action, ThunkAction, ThunkDispatch } from "@reduxjs/toolkit";

import { NotificationReference } from "@app/models";
import { createInfo } from "@app/core";
import { getLocalizedText, LocaleKeys } from "@app/locale";

import { GlobalAppState } from "@app/store";
import { ShowLocalizedMessageFn, showNotifications } from "@app/store/notificator";

/**
 * Create dispatch-based action to display info message
 * @param dispatch Redux store dispatcher
 * @param getState Function that provides current app global state
 * @returns Redux store action displaying info message
 */
export const getDisplayInfoFn = (
    dispatch: ThunkDispatch<GlobalAppState, unknown, Action>,
): ShowLocalizedMessageFn => {
    return (message: keyof LocaleKeys, important?: boolean, _?: boolean, link?: NotificationReference) => {
        dispatch(
            showNotifications(
                [createInfo(
                    getLocalizedText(message),
                    important,
                    link
                )]
            )
        );
    };
};

/**
 * Create redux thunk to display info notifications
 * @param message Message to display locale key
 * @param important Should message stay on screen until manual user close action
 * @param link Link configuration
 * @returns Redux thunk
 */
export const displayInfo = (message: keyof LocaleKeys, important?: boolean, link?: NotificationReference): ThunkAction<void, GlobalAppState, unknown, Action> =>
    (dispatch: ThunkDispatch<GlobalAppState, unknown, Action>): void => {
        const fn = getDisplayInfoFn(dispatch);

        fn(message, important, undefined, link);
    };
