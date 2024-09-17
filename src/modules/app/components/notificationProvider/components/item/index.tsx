import { useCallback, useEffect } from "react";
import { Link } from "react-router-dom";

import { getClassName, isNullOrUndefined } from "@bodynarf/utils";
import Icon from "@bodynarf/react.components/components/icon";

import "./style.scss";

import { Notification } from "@app/models";
import { getClassNameForType } from "@app/core";
import { openCurrentErrorLogFile } from "@app/core/log";

/** Notification component props */
interface NotificationItemProps {
    /** Notification to display */
    item: Notification;

    /** Hide notification handler */
    hide: (id: string) => void;
}

/** Single displayable notification component */
const NotificationItem = ({
    item, hide,
}: NotificationItemProps): JSX.Element => {
    const className = getClassName([
        "notification",
        "has-text-wrapped",
        getClassNameForType(item.type)
    ]);

    const onHideClick = useCallback(() => hide(item.id), [hide, item.id]);
    const openErrorFile = useCallback(() => openCurrentErrorLogFile(), []);

    useEffect(() => {
        if (!item.important ?? false) {
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
                title="Hide notification"
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
