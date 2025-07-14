import { FC, useCallback, useMemo } from "react";
import { connect } from "react-redux";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import { Notification } from "@app/models";
import { getLocalizedText } from "@app/locale";
import { GlobalAppState } from "@app/store";
import { displayWarn, hideAllNotifications, hideNotification } from "@app/store/notificator";
import { appSession } from "@app/shared/values";

import "./style.scss";

import NotificationItem from "../components/item";

/** Props of NotificationProvider component */
type NotificationProviderProps = {
    /** Displayable notifications */
    notifications: Array<Notification>;

    /** Hide notification handler */
    hideNotification: (id: string) => void;

    /** Hide all visible notifications */
    hideAll: () => void;

    /**
     * Display warn message
     * @param message Message to display
     */
    displayWarning: (message: string) => void;
};

/** Container with displayable notifications */
const NotificationProvider: FC<NotificationProviderProps> = ({
    notifications,
    hideNotification, hideAll,
    displayWarning,
}) => {
    const hideAllNotifications = useCallback(() => hideAll(), [hideAll]);
    const items = useMemo(() => notifications.filter(({ sessionId }) => sessionId === appSession.id), [notifications]);

    return (
        <TransitionGroup
            role="notification-container"
        >
            {items.length >= 3 &&
                <CSSTransition
                    key="notification-cleaner"

                    timeout={250}
                    classNames="notification-cleaner"
                >
                    <span
                        onClick={hideAllNotifications}
                        className="notification-cleaner"
                        title={getLocalizedText("app.notification.dismissAllTitle")}
                    >
                        {getLocalizedText("app.notification.dismissAll")}
                    </span>
                </CSSTransition>
            }
            {items.map(x =>
                <CSSTransition
                    key={x.id}

                    timeout={250}
                    classNames="notification"
                >
                    <NotificationItem
                        key={x.id}

                        item={x}
                        hide={hideNotification}
                        displayWarning={displayWarning}
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
        displayWarning: displayWarn
    }
)(NotificationProvider);
