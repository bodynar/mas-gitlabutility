import { FC, useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

import { isNullOrUndefined } from "@bodynarf/utils";
import { ElementPosition, usePagination } from "@bodynarf/react.components";
import Paginator from "@bodynarf/react.components/components/paginator";
import Icon from "@bodynarf/react.components/components/icon";

import { Notification, Session } from "@app/models";
import { getLocalizedText } from "@app/locale";
import { getClassNameForType } from "@app/core";
import { openErrorLogFile } from "@app/core/log";
import { GlobalAppState } from "@app/store";
import { displayWarn } from "@app/store/notificator";
import { appSession } from "@app/shared/values";

import SessionSelector from "@app/shared/components/sessionSelector";

/** Notification list props */
type NotificationsProps = {
    /** All notifications */
    notifications: Array<Notification>;

    /**
     * Display warn message
     * @param message Message to display
     */
    displayWarning: (message: string) => void;
};

/** Notification list */
const Notifications: FC<NotificationsProps> = ({
    notifications,
    displayWarning,
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
                    <span className="has-text-weight-bold">
                        {getLocalizedText("common.notifications")}
                    </span>: {items.length}
                </div>
            </div>
            {pageItems.length === 0
                &&
                <p className="has-text-grey has-text-wrapped has-text-centered">
                    {getLocalizedText("notifications.noItemsToDisplayError")}
                </p>
            }
            {pageItems.length > 0 &&
                <div className="block">
                    {pageItems.map(x =>
                        <NotificationItem
                            key={x.id}
                            item={x}
                            displayWarning={displayWarning}
                        />
                    )}
                    <Paginator
                        showNextButtons
                        nearPagesCount={1}
                        count={pagesCount}
                        currentPage={currentPage}
                        onPageChange={onPageChange}
                        position={ElementPosition.Right}

                        resources={{
                            nextPageCaption: getLocalizedText("shared.paginator.nextPageCaption"),
                            nextPageTitle: getLocalizedText("shared.paginator.nextPageTitle"),
                            openConcretePageTitleTemplate: getLocalizedText("shared.paginator.openConcretePageTitleTemplate"),
                            previousPageCaption: getLocalizedText("shared.paginator.previousPageCaption"),
                            previousPageTitle: getLocalizedText("shared.paginator.previousPageTitle")
                        }}
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
    }) as Partial<NotificationsProps>,
    {
        displayWarning: displayWarn
    }
)(Notifications);

/** Props for `NotificationItem` */
type NotificationItemProps = {
    /** Notification item data */
    item: Notification;

    /**
     * Display warn message
     * @param message Message to display
     */
    displayWarning: (message: string) => void;
};

/** Component for displaying single notification */
const NotificationItem: FC<NotificationItemProps> = ({
    item, displayWarning,
}) => {
    const isErrorCommand = !isNullOrUndefined(item.link) && item.link.ref.startsWith("#!command");
    const openErrorFile = useCallback(
        () => {
            const hasLogFile = openErrorLogFile(item.createdOn);

            if (!hasLogFile) {
                displayWarning(getLocalizedText("shared.logFileIsNotFound"));
            }
        },
        [displayWarning, item.createdOn]
    );

    return (
        <div
            key={item.id}
            className={`message my-2 ${getClassNameForType(item.type)}`}
        >
            <div className="message-body has-text-wrapped">
                <span className="is-italic">
                    {getLocalizedText("common.createdOn")} {item.createdOn.format("DD.MM HH:mm:ss")}
                </span>
                <br />
                <span className="has-text-weight-bold">
                    {getLocalizedText("notifications.message")}:
                </span>
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
