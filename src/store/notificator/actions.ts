import { createAction } from "@reduxjs/toolkit";

import { Notification } from "@app/models";

/**
 * Show notifications
 * @param _ Adding notifications
 */
export const showNotifications = createAction<Array<Notification>>("mas.gua/not/showNotifications");

/**
 * Hide notification
 * @param _ Identifier of notification to hide
 */
export const hideNotification = createAction<string>("mas.gua/not/hideNotification");

/**
 * Hide notifications
 * @param _ Identifiers of notifications to hide
 */
export const hideNotifications = createAction<Array<string>>("mas.gua/not/hideNotifications");

/** Hide all visible notifications */
export const hideAllNotifications = createAction("mas.gua/not/hideAllNotifications");
