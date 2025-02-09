import { FC, useCallback, useMemo, useState } from "react";
import { connect } from "react-redux";

import moment from "moment";

import { isNullish } from "@bodynarf/utils";
import { SelectableItem } from "@bodynarf/react.components";
import Dropdown from "@bodynarf/react.components/components/dropdown";

import { OperationResult, Session, Notification } from "@app/models";
import { GlobalAppState } from "@app/store";
import { appSession } from "@app/shared/values";

/** Props of `SessionSelector` */
type SessionSelectorProps = {
    /** App sessions */
    sessions: Array<Session>;

    /** Notifications history */
    notifications: Array<Notification>;

    /** Operation results history */
    results: Array<OperationResult<any>>;

    /** Type of display */
    mode: "Notifications" | "Results";

    /**
     * Handler of session select
     * @param selectedSession Selected session
     */
    onSessionSelected: (selectedSession: Session) => void;
};

const SessionSelector: FC<SessionSelectorProps> = ({
    sessions, onSessionSelected,
    mode, notifications, results,
}) => {
    const items = useMemo(() =>
        sessions
            .map(session => ({
                id: session.id,
                value: session.id,
                displayValue: getSessionDisplayValue(session, mode, notifications, results,)
            }) as SelectableItem),
        [mode, notifications, results, sessions]
    );

    const sessionsMap = useMemo(() =>
        new Map(sessions.map(x => [x.id, x])),
        [sessions]
    );

    const [item, selectedItem] = useState(items[items.length - 1]);

    const onSelect = useCallback(
        (item: SelectableItem) => {
            selectedItem(item);

            if (!isNullish(item)) {
                onSessionSelected(sessionsMap.get(item.id));
            }
        },
        [onSessionSelected, sessionsMap]
    );

    return (
        <Dropdown
            compact
            searchable
            value={item}
            items={items}
            hideOnOuterClick
            onSelect={onSelect}
            placeholder="Sessions"
            label={{
                caption: "Session",
                horizontal: false
            }}
        />
    );
};

/** Selector of sessions */
export default connect(
    ({ app }: GlobalAppState) => ({
        sessions: app.appHistory.sessions,
        results: app.appHistory.results,
        notifications: app.appHistory.notifications,
    }),
    undefined
)(SessionSelector);

/**
 * Get session caption
 * @param session Session
 * @param mode Type of display
 * @param notifications Notifications history
 * @param results Operation results history
 * @returns Formatted caption for session
 */
const getSessionDisplayValue = (
    session: Session,
    mode: "Notifications" | "Results",
    notifications: Array<Notification>,
    results: Array<OperationResult<any>>,
): string => {
    const postfix =
        mode === "Notifications"
            ? notifications.filter(({ sessionId }) => sessionId === session.id).length
            : results.filter(({ sessionId }) => sessionId === session.id).length;
    const prefix = session.id === appSession.id ? "[Current] " : "";
    const startAt = moment(session.startedAt);

    if (isNullish(session.canceledAt)) {
        return prefix + startAt.format("DD.MM HH:mm") + ` (${postfix})`;
    }

    const endAt = moment(session.canceledAt);

    return endAt.day === startAt.day
        ? `${prefix} ${startAt.format("DD.MM HH:mm")} - ${startAt.format("HH:mm")} (${postfix})`
        : `${prefix} ${startAt.format("DD.MM HH:mm")} - ${startAt.format("DD.MM HH:mm")} (${postfix})`;
};
