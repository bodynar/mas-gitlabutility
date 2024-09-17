import moment from "moment";

import { generateGuid } from "@bodynarf/utils";

import { Notification, NotificationReference, NotificationType } from "@app/models";

/**
 * Build notification model from parts
 * @param message Notification message
 * @param type Type of notification
 * @param important Shouldn't be hidden automatically
 * @param link Link configuration
 * @returns Instance of `Notification`
 */
const createNotification = (
    message: string, type: NotificationType,
    important = false,
    link: NotificationReference = undefined
): Notification => ({
    id: generateGuid(),
    createdOn: moment(),
    message,
    type,
    important,
    hidden: false,
    link,
});

/**
 * Create informational notification
 * @param message Informational message
 * @param important Shouldn't be hidden automatically
 * @param link Link configuration
 * @returns Instance of `Notification`
 */
export const createInfo = (
    message: string, important = false,
    link: NotificationReference = undefined
): Notification => createNotification(message, NotificationType.info, important, link);

/**
 * Create success notification
 * @param message Success description message
 * @param important Shouldn't be hidden automatically
 * @param link Link configuration
 * @returns Instance of `Notification`
 */
export const createSuccess = (
    message: string, important = false,
    link: NotificationReference = undefined
): Notification => createNotification(message, NotificationType.success, important, link);

/**
 * Create warning notification
 * @param message Warning message
 * @param important Shouldn't be hidden automatically
 * @param link Link configuration
 * @returns Instance of `Notification`
 */
export const createWarn = (
    message: string, important = false,
    link: NotificationReference = undefined
): Notification => createNotification(message, NotificationType.warn, important, link);

/**
 * Create error notification
 * @param message Error message
 * @param link Link configuration
 * @returns Instance of `Notification`
 */
export const createError = (
    message: string,
    link: NotificationReference = undefined
): Notification => createNotification(message, NotificationType.error, true, link);

/** Notification type to element class name map */
const typeToClassNameMap: Map<NotificationType, string> = new Map([
    [NotificationType.info, "is-info"],
    [NotificationType.success, "is-success"],
    [NotificationType.warn, "is-warning"],
    [NotificationType.error, "is-danger"],
]);

/**
 * Get element class name by notification type
 * @param type Notification type
 * @returns Element class name, according to bulma css package
 */
export const getClassNameForType = (type: NotificationType): string => {
    return typeToClassNameMap.get(type);
};
