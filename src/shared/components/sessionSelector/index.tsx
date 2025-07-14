import { FC, useCallback, useMemo, useState } from "react";
import { connect } from "react-redux";

import moment from "moment";

import { isNullish } from "@bodynarf/utils";
import { SelectableItem } from "@bodynarf/react.components";
import Dropdown from "@bodynarf/react.components/components/dropdown";

import { OperationResult, Session, Notification, ActionResult } from "@app/models";
import { getLocalizedText } from "@app/locale";
import { GlobalAppState } from "@app/store";
import { appSession } from "@app/shared/values";

/** Props of `SessionSelector` */
type SessionSelectorProps = {
    /** App sessions */
    sessions: Array<Session>;

    /** Notifications history */
    notifications: Array<Notification>;

    /** Operation results history */
    results: Array<OperationResult<ActionResult>>;

    /** Type of display */
    mode: "Notifications" | "Results";

    /** Selected value by default */
    defaultValue?: Session;

    /**
     * Handler of session select
     * @param selectedSession Selected session
     */
    onSessionSelected: (selectedSession: Session) => void;
};

const SessionSelector: FC<SessionSelectorProps> = ({
    sessions, onSessionSelected,
    mode, notifications, results,
    defaultValue,
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

    const defaultItem = useMemo(() =>
        isNullish(defaultValue)
            ? items[items.length - 1]
            : items.find(({ id }) => id === defaultValue.id),
        [defaultValue, items]
    );

    const [item, selectItem] = useState(defaultItem);

    const onSelect = useCallback(
        (item: SelectableItem) => {
            selectItem(item);

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
            placeholder={getLocalizedText("common.session")}
            label={{
                caption: getLocalizedText("common.session"),
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
    results: Array<OperationResult<ActionResult>>,
): string => {
    const postfix =
        mode === "Notifications"
            ? notifications.filter(({ sessionId }) => sessionId === session.id).length
            : results.filter(({ sessionId }) => sessionId === session.id).length;
    const startAt = moment(session.startedAt);

    const currentCaption = getLocalizedText("shared.sessionSelector.current");

    if (isNullish(session.canceledAt)) {
        const prefix = session.id === appSession.id ? `[${currentCaption}] ` : "";

        return prefix + startAt.format("DD.MM HH:mm") + ` (${postfix})`;
    }

    const endAt = moment(session.canceledAt);

    return endAt.day === startAt.day
        ? `${startAt.format("DD.MM HH:mm")} - ${startAt.format("HH:mm")} (${postfix})`
        : `${startAt.format("DD.MM HH:mm")} - ${startAt.format("DD.MM HH:mm")} (${postfix})`;
};
