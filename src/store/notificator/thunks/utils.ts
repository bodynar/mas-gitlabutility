import { ThunkDispatch } from "redux-thunk";
import { Action } from "@reduxjs/toolkit";

import { GlobalAppState } from "@app/store";
import { getDisplayErrorFn, getDisplaySuccessFn, ShowErrorFn, ShowSimpleMessageFn } from "@app/store/notificator";

/**
 * Get success or error notification
 * @param dispatch Redux store dispatcher
 * @returns Pair of functions that can display notifications in success or error state
 */
export const getNotifications = (
    dispatch: ThunkDispatch<GlobalAppState, unknown, Action>,
): [ShowSimpleMessageFn, ShowErrorFn] => {
    return [
        getDisplaySuccessFn(dispatch),
        getDisplayErrorFn(dispatch),
    ];
};
