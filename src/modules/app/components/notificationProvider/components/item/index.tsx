import { FC, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";

import { getClassName, isNullOrUndefined } from "@bodynarf/utils";
import Icon from "@bodynarf/react.components/components/icon";

import "./style.scss";

import { Notification } from "@app/models";
import { getLocalizedText } from "@app/locale";
import { getClassNameForType } from "@app/core";
import { openErrorLogFile } from "@app/core/log";

/** Notification component props */
type NotificationItemProps = {
    /** Notification to display */
    item: Notification;

    /** Hide notification handler */
    hide: (id: string) => void;

    /**
     * Display warn message
     * @param message Message to display
     */
    displayWarning: (message: string) => void;
};

/** Single displayable notification component */
const NotificationItem: FC<NotificationItemProps> = ({
    item, hide,
    displayWarning,
}) => {
    const className = getClassName([
        "notification",
        "has-text-wrapped",
        getClassNameForType(item.type)
    ]);

    const onHideClick = useCallback(() => hide(item.id), [hide, item.id]);
    const openErrorFile = useCallback(
        () => {
            const hasLogFile = openErrorLogFile(item.createdOn);

            if (!hasLogFile) {
                displayWarning(getLocalizedText("shared.logFileIsNotFound"));
            }
        },
        [displayWarning, item.createdOn]
    );

    useEffect(() => {
        if (!item.important) {
            const timeout = setTimeout(() => onHideClick(), 5 * 1000);

            return () => clearTimeout(timeout);
        }
    }, [item.important, onHideClick]);

    const isErrorCommand = !isNullOrUndefined(item.link) && item.link.ref.startsWith("#!command");

    return (
        <div className={className}>
            <button
                className="delete"
                onClick={onHideClick}
                title={getLocalizedText("app.notification.hideNotificationTitle")}
            >
            </button>
            {item.message}
            {!isNullOrUndefined(item.link) &&
                <span
                    className="is-block mt-2 is-clickable"
                    onClick={isErrorCommand ? openErrorFile : undefined}
                >
                    <Icon name="link-45deg" /> {isErrorCommand
                        ? <span className="is-underlined">{item.link.caption}</span>
                        : <Link to={item.link.ref}>{item.link.caption}</Link>
                    }
                </span>
            }
        </div>
    );
};

export default NotificationItem;
