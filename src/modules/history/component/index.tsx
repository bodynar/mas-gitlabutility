import { FC, useCallback, useMemo } from "react";
import { connect } from "react-redux";

import moment from "moment";

import { isNullish } from "@bodynarf/utils";
import { ElementSize } from "@bodynarf/react.components";
import Button from "@bodynarf/react.components/components/button/component";

import { appSession } from "@app/shared/values";
import { GlobalAppState } from "@app/store";
import { AppHistory, clearAppHistoryAsync } from "@app/store/app";

import "./style.scss";

/** Props type of `HistoryModule` */
type HistoryModuleProps = {
    /** History of app */
    history: AppHistory,

    /** Remove all recorded history */
    clearHistory: () => void;
};

const HistoryModule: FC<HistoryModuleProps> = ({
    history, clearHistory,
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
                            notifications: history.notifications.filter(({ sessionId }) => sessionId === id),
                            results: history.results.filter(({ sessionId }) => sessionId === id),
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

    const onClearHistoryClick = useCallback(clearHistory, [clearHistory]);

    return (
        <section role="history">
            <div className="block">
                <h5 className="subtitle is-5">
                    Current session
                </h5>
                <div className="mb-1">
                    <span className="has-text-weight-bold">
                        Id</span>: <span>
                        {appSession.id}
                    </span>
                </div>
                <div className="mb-1">
                    <span className="has-text-weight-bold">
                        Started at</span>: <span>
                        {moment(appSession.startedAt).format("DD.MM HH:mm")}
                    </span>
                </div>
                <div className="mb-1">
                    <span className="has-text-weight-bold">
                        Notifications</span>: <span>
                        {historyMap.get(appSession.id).notifications.length}
                    </span>
                </div>
                <div className="mb-1">
                    <span className="has-text-weight-bold">
                        Operation results</span>: <span>
                        {historyMap.get(appSession.id).results.length}
                    </span>
                </div>
            </div>

            <hr />

            <div className="block">
                <h5 className="subtitle is-5">
                    Session history
                </h5>

                {sessionHistory.length === 0 &&
                    <p className="has-text-grey has-text-wrapped is-italic" style={{ fontSize: "0.925rem"}}>
                        Session history is empty
                        {`\n`}
                        {`ᓚᘏᗢ`}
                    </p>
                }

                {sessionHistory.length > 0 &&
                    <Button
                        type="danger"
                        outlined
                        caption="Clear history"
                        size={ElementSize.Small}
                        onClick={onClearHistoryClick}
                    />
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
                                Notifications: <span className="has-text-weight-bold">
                                    {item.notifications.length}
                                </span>
                                <br />
                                Operation results: <span className="has-text-weight-bold">
                                    {item.results.length}
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
        clearHistory: clearAppHistoryAsync
    }
)(HistoryModule);
