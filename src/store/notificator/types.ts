import { Notification, NotificationReference } from "@app/models";

/** Application notificator state */
export interface NotificatorState {
    /** All notifications */
    notifications: Array<Notification>;
}

/**
 * Function that can display notification
 * @param message Message to display
 * @param important Should message stay on screen until manual user close action
 * @param link Link configuration
 * @param removeLoadingState Should app loading state be removed
 */
type ShowNotificationFn<TMessage> = (message: TMessage, important?: boolean, removeLoadingState?: boolean, link?: NotificationReference) => void;

/** Success notification show function type */
export type ShowSimpleMessageFn = ShowNotificationFn<string>;

/** Error notification show function type */
export type ShowErrorFn = ShowNotificationFn<Error | string>;
