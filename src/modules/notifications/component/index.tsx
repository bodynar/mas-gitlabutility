import { useMemo } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

import { isNullOrUndefined } from "@bodynarf/utils";
import { ElementPosition, usePagination } from "@bodynarf/react.components";
import Paginator from "@bodynarf/react.components/components/paginator";
import Icon from "@bodynarf/react.components/components/icon";

import { Notification } from "@app/models";
import { getClassNameForType } from "@app/core";
import { GlobalAppState } from "@app/store";

/** Notification list props */
interface NotificationsProps {
    /** All notifications */
    notifications: Array<Notification>;
}

/** Notification list */
const Notifications = ({
    notifications,
}: NotificationsProps): JSX.Element => {
    const [{ currentPage, pagesCount, onPageChange }, paginate] = usePagination(notifications.length, 10);
    const pageItems: Array<Notification> = useMemo(
        () => paginate(notifications),
        [paginate, notifications]
    );

    if (notifications.length === 0) {
        return (<>
            <p className="has-text-grey has-text-wrapped has-text-centered">
                No notifications to display
                {`\n`}
                Complete any action to see something here
                {`\n`}
                {`(●'◡'●)`}
            </p>
        </>);
    }

    /**
     * // TODO:
     *  v2: 
     *  - search for notification?
     *  - order by created on
     */

    return (
        <section>
            <div className="block columns is-align-items-center">
                <div className="column is-2">
                    <span className="has-text-weight-bold">Notifications</span>: {notifications.length}
                </div>
            </div>
            <div className="block">
                {pageItems.map(x =>
                    <div
                        key={x.id}
                        className={`message my-2 ${getClassNameForType(x.type)}`}
                    >
                        <div className="message-body has-text-wrapped">
                            <span className="is-italic">
                                Created on {x.createdOn.format("DD.MM hh:mm:ss")}
                            </span>
                            {`\n`}
                            <span className="has-text-weight-bold">Message:</span>
                            <p>
                                {x.message}
                            </p>
                            {!isNullOrUndefined(x.link) &&
                                <span className="is-block mt-2">
                                    <Icon name="link-45deg" /> <Link to={x.link.ref}>{x.link.caption}</Link>
                                </span>
                            }
                        </div>
                    </div>
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
        </section>
    );
};

/** Notification list */
export default connect(
    ({ notificator }: GlobalAppState) => ({
        notifications: notificator.notifications,
    }) as NotificationsProps,
    {}
)(Notifications);
