import { createReducer } from "@reduxjs/toolkit";

import { isNullOrUndefined } from "@bodynarf/utils";

import { NotificatorState, hideAllNotifications, hideNotification, hideNotifications, showNotifications } from ".";

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
                    .filter(({ hidden}) => !hidden)
                    .forEach(x => x.hidden = true)    
                ;
            })
            ;
    }
);
