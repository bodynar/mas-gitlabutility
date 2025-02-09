import { createReducer } from "@reduxjs/toolkit";

import moment from "moment";

import { isNullOrUndefined } from "@bodynarf/utils";

import { appSession } from "@app/shared/values";
import { NotificatorState, hideAllNotifications, hideNotification, hideNotifications, showNotifications } from ".";
import { initHistory, removeHistory } from "../app";

const defaultState: NotificatorState = {
    notifications: [],
};

/** Application notifications state reducer */
export const reducer = createReducer(defaultState,
    (builder) => {
        builder
            .addCase(showNotifications, (state, { payload }) => {
                state.notifications = state.notifications.concat(...payload);
            })
            .addCase(hideNotification, (state, { payload }) => {
                const notification = state.notifications.find(({ id }) => id === payload);

                if (isNullOrUndefined(notification)) {
                    return;
                }

                notification.hidden = true;
            })
            .addCase(hideNotifications, (state, { payload }) => {
                const notifications = state.notifications.filter(({ id }) => payload.includes(id));

                if (notifications.length === 0) {
                    return;
                }

                notifications.forEach(x => x.hidden = true);
            })
            .addCase(hideAllNotifications, (state) => {
                state.notifications
                    .filter(({ hidden }) => !hidden)
                    .forEach(x => x.hidden = true)
                    ;
            })
            .addCase(initHistory, (state, { payload }) => {
                state.notifications.push(
                    ...payload.notifications
                        .map(x => ({
                            ...x,
                            createdOn: moment(x.createdOn),
                            hidden: true,
                        }))
                );
            })
            .addCase(removeHistory, (state) => {
                state.notifications = state.notifications.filter(({ sessionId }) => sessionId === appSession.id);
            })
            ;
    }
);
