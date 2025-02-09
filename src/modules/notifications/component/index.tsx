import { FC, useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

import { isNullOrUndefined } from "@bodynarf/utils";
import { ElementPosition, usePagination } from "@bodynarf/react.components";
import Paginator from "@bodynarf/react.components/components/paginator";
import Icon from "@bodynarf/react.components/components/icon";

import { Notification, Session } from "@app/models";
import { getClassNameForType } from "@app/core";
import { GlobalAppState } from "@app/store";
import { appSession } from "@app/shared/values";
import { openCurrentErrorLogFile } from "@app/core/log";

import SessionSelector from "@app/shared/components/sessionSelector";

/** Notification list props */
interface NotificationsProps {
    /** All notifications */
    notifications: Array<Notification>;
}

/** Notification list */
const Notifications: FC<NotificationsProps> = ({
    notifications,
}) => {
    const [items, setItems] = useState(
        notifications.filter(({ sessionId }) => sessionId === appSession.id)
    );

    const onSessionSelectionChange = useCallback(
        (selectedSession: Session) =>
            setItems(
                notifications.filter(({ sessionId }) => sessionId === selectedSession.id)
            )
        , [notifications]
    );

    const [{ currentPage, pagesCount, onPageChange }, paginate] = usePagination(items.length, 10);
    const pageItems: Array<Notification> = useMemo(
        () => paginate(items),
        [paginate, items]
    );

    return (
        <section>
            <div className="block">
                <SessionSelector
                    mode="Notifications"
                    onSessionSelected={onSessionSelectionChange}
                />
            </div>
            <div className="block columns is-align-items-center">
                <div className="column is-2">
                    <span className="has-text-weight-bold">Notifications</span>: {items.length}
                </div>
            </div>
            {pageItems.length === 0
                &&
                <p className="has-text-grey has-text-wrapped has-text-centered">
                    No notifications to display
                    {`\n`}
                    Try selecting other session or complete any action to see notification in current session
                    {`\n`}
                    {`(●'◡'●)`}
                </p>
            }
            {pageItems.length > 0 &&
                <div className="block">
                    {pageItems.map(x =>
                        <NotificationItem
                            key={x.id}
                            item={x}
                        />
                    )}
                    <Paginator
                        showNextButtons
                        nearPagesCount={1}
                        count={pagesCount}
                        currentPage={currentPage}
                        onPageChange={onPageChange}
                        position={ElementPosition.Right}
                    />
                </div>
            }
        </section>
    );
};

/** Notification list */
export default connect(
    ({ notificator, app }: GlobalAppState) => ({
        notifications: notificator.notifications,
        history: app.appHistory,
    }) as NotificationsProps,
    {}
)(Notifications);

type NotificationItemProps = {
    item: Notification;
};

const NotificationItem: FC<NotificationItemProps> = ({
    item,
}) => {
    const isErrorCommand = !isNullOrUndefined(item.link) && item.link.ref.startsWith("#!command");
    const openErrorFile = useCallback(() => openCurrentErrorLogFile(), []);

    return (
        <div
            key={item.id}
            className={`message my-2 ${getClassNameForType(item.type)}`}
        >
            <div className="message-body has-text-wrapped">
                <span className="is-italic">
                    Created on {item.createdOn.format("DD.MM HH:mm:ss")}
                </span>
                {`\n`}
                <span className="has-text-weight-bold">Message:</span>
                <p>
                    {item.message}
                </p>
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
        </div>
    );
};
