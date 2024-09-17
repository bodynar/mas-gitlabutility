import { useCallback } from "react";
import { connect } from "react-redux";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import { Notification } from "@app/models";
import { GlobalAppState } from "@app/store";
import { hideAllNotifications, hideNotification } from "@app/store/notificator";

import "./style.scss";

import NotificationItem from "../components/item";

/** Props of NotificationProvider component */
interface NotificationProviderProps {
    /** Displayable notifications */
    notifications: Array<Notification>;

    /** Hide notification handler */
    hideNotification: (id: string) => void;

    /** Hide all visible notifications */
    hideAll: () => void;
}

/** Container with displayable notifications */
const NotificationProvider = ({
    notifications,
    hideNotification, hideAll,
}: NotificationProviderProps): JSX.Element => {
    const hideAllNotifications = useCallback(() => hideAll(), [hideAll]);

    return (
        <TransitionGroup
            role="notification-container"
        >
            {notifications.length >= 3 &&
                <CSSTransition
                    timeout={250}
                    key="notification-cleaner"
                    classNames="notification-cleaner"
                >
                    <span
                        onClick={hideAllNotifications}
                        className="notification-cleaner"
                        title="Dismiss all notifications"
                    >
                        Dismiss all
                    </span>
                </CSSTransition>
            }
            {notifications.map(x =>
                <CSSTransition
                    key={x.id}
                    timeout={250}
                    classNames="notification"
                >
                    <NotificationItem
                        key={x.id}
                        item={x}
                        hide={hideNotification}
                    />
                </CSSTransition>
            )}
        </TransitionGroup>
    );
};

/** Container with displayable notifications */
export default connect(
    ({ notificator }: GlobalAppState) => ({
        notifications: notificator.notifications.filter(({ hidden }) => !hidden),
    }),
    {
        hideNotification,
        hideAll: hideAllNotifications,
    }
)(NotificationProvider);
