import { FC, useCallback, useMemo } from "react";
import { connect } from "react-redux";

import moment from "moment";

import { isNullish } from "@bodynarf/utils";
import { ElementSize } from "@bodynarf/react.components";
import Button from "@bodynarf/react.components/components/button/component";

import { getLocalizedText } from "@app/locale";
import { appSession } from "@app/shared/values";
import { GlobalAppState } from "@app/store";
import { AppHistory, clearAppHistoryAsync, clearEmptyRecordsAsync } from "@app/store/app";

import "./style.scss";

/** Props type of `HistoryModule` */
type HistoryModuleProps = {
    /** History of app */
    history: AppHistory,

    /** Remove all recorded history */
    clearHistory: () => void;

    /**
     * Clear app session history items with no related data
     * @param sessionMap Session dictionary
     */
    clearEmptyRecords: (sessionMap: Map<string, { notifications: number; results: number; }>) => void;
};

const HistoryModule: FC<HistoryModuleProps> = ({
    history, clearHistory, clearEmptyRecords,
}) => {
    const historyMap = useMemo(
        () =>
            new Map(
                history.sessions
                    .map(({ startedAt, id, canceledAt }) => [
                        id, {
                            id,
                            startedAt,
                            canceledAt,
                            notifications: history.notifications.filter(({ sessionId }) => sessionId === id).length,
                            results: history.results.filter(({ sessionId }) => sessionId === id).length,
                        }
                    ])
            )
        ,
        [history]
    );

    const sessionHistory = useMemo(
        () =>
            Array
                .from(historyMap.entries())
                .filter(([key]) => appSession.id !== key)
                .map(([, value]) => ({
                    ...value,
                    startedAt: moment(value.startedAt).format("DD.MM HH:mm"),
                    canceledAt: isNullish(value.canceledAt) ? "???" : moment(value.canceledAt).format("DD.MM HH:mm")
                })),
        [historyMap]
    );

    const hasEmptyRecord = useMemo(
        () => Array.from(
            historyMap
                .values()
                .filter(({ id, notifications, results }) => id !== appSession.id && notifications === 0 && results === 0)
        ).length !== 0, [historyMap]);

    const onClearHistoryClick = useCallback(clearHistory, [clearHistory]);
    const onCleanEmptyRecordsClick = useCallback(() => clearEmptyRecords(historyMap), [clearEmptyRecords, historyMap]);

    return (
        <section role="history">
            <div className="block">
                <h5 className="subtitle is-5">
                    {getLocalizedText("history.currentSession")}
                </h5>
                <div className="mb-1">
                    <span className="has-text-weight-bold">
                        Id
                    </span>: <span>
                        {appSession.id}
                    </span>
                </div>
                <div className="mb-1">
                    <span className="has-text-weight-bold">
                        {getLocalizedText("history.startedAt")}
                    </span>: <span>
                        {moment(appSession.startedAt).format("DD.MM HH:mm")}
                    </span>
                </div>
                <div className="mb-1">
                    <span className="has-text-weight-bold">
                        {getLocalizedText("common.notifications")}
                    </span>: <span>
                        {historyMap.get(appSession.id).notifications}
                    </span>
                </div>
                <div className="mb-1">
                    <span className="has-text-weight-bold">
                        {getLocalizedText("history.operationResultsCount")}
                    </span>: <span>
                        {historyMap.get(appSession.id).results}
                    </span>
                </div>
            </div>

            <hr />

            <div className="block">
                <h5 className="subtitle is-5">
                    {getLocalizedText("app.menu.sessionHistoryMenuItemCaption")}
                </h5>

                {sessionHistory.length === 0 &&
                    <p className="has-text-grey has-text-wrapped is-italic" style={{ fontSize: "0.925rem" }}>
                        {getLocalizedText("history.sessionHistoryIsEmpty")}
                    </p>
                }

                {sessionHistory.length > 0 &&
                    <>
                        <Button
                            outlined
                            type="danger"
                            size={ElementSize.Small}
                            onClick={onClearHistoryClick}
                            caption={getLocalizedText("history.clearSessionHistory")}
                        />
                        {hasEmptyRecord &&
                            <Button
                                className="ml-2"
                                outlined
                                type="ghost"
                                size={ElementSize.Small}
                                onClick={onCleanEmptyRecordsClick}
                                caption={getLocalizedText("history.clearEmptyRecords")}
                                title={getLocalizedText("history.clearEmptyRecordsTitle")}
                            />
                        }
                    </>
                }

                <div className="block mt-4">
                    <ul className="history-list">
                        {sessionHistory.map((item) =>
                            <li
                                key={item.id}
                                className="mb-3"
                            >
                                {item.id.slice(0, 8)}: <span className="is-italic">
                                    [{item.startedAt} - {item.canceledAt}]
                                </span>
                                <br />
                                {getLocalizedText("common.notifications")}: <span className="has-text-weight-bold">
                                    {item.notifications}
                                </span>
                                <br />
                                {getLocalizedText("history.operationResultsCount")}: <span className="has-text-weight-bold">
                                    {item.results}
                                </span>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </section>
    );
};

/** Component for history module */
export default connect(
    ({ app }: GlobalAppState) => ({
        history: app.appHistory,
    }),
    {
        clearHistory: clearAppHistoryAsync,
        clearEmptyRecords: clearEmptyRecordsAsync
    }
)(HistoryModule);
