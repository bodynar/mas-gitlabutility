import { FC, useCallback } from "react";
import { connect } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import moment from "moment";

import { emptyFn, isNullish, isNullOrUndefined } from "@bodynarf/utils";
import Button from "@bodynarf/react.components/components/button/component";
import Text from "@bodynarf/react.components/components/primitives/text";
import Multiline from "@bodynarf/react.components/components/primitives/multiline";
import Icon from "@bodynarf/react.components/components/icon";

import { ActionResult, ActionResultState, OperationResult as OperationResultModel, Project, Session } from "@app/models";
import { getLocalizedText } from "@app/locale";
import { appSession } from "@app/shared/values";
import { getActionDescription } from "@app/core/gitlab/actions";
import { GlobalAppState } from "@app/store";

import ResultDisplay from "../resultDisplay";

/** Props of `OperationResult` */
type OperationResultProps = {
    /** Results of the operations performed */
    items: Array<OperationResultModel<ActionResult>>;

    /** Available projects */
    projects: Array<Project>;

    /** App sessions */
    sessions: Array<Session>;
};

/** Information about single performed operation display component */
const OperationResult: FC<OperationResultProps> = ({
    items, projects, sessions,
}) => {
    const { id } = useParams();

    const navigate = useNavigate();

    const onBackClick = useCallback(
        () => navigate("/r/", {
            state: {
                sessionItem: sessions.find(({ id }) => id === item?.sessionId)
            }
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [navigate, sessions]
    );

    if (isNullOrUndefined(id)) {
        return (
            <>
                <Button
                    outlined
                    type="info"
                    className="mb-2"
                    onClick={onBackClick}
                    caption={getLocalizedText("common.back")}
                />
                <span className="has-text-danger">
                    {getLocalizedText("results.resultIdIsEmpty")}
                </span>
            </>
        );
    }

    const item = items.find(x => id === x.id);

    if (isNullOrUndefined(item)) {
        return (
            <>
                <Button
                    type="ghost"
                    onClick={onBackClick}
                    className="p-0 is-italic"
                    icon={{ name: "arrow-left-short" }}
                    caption={getLocalizedText("common.back")}
                />
                <div>
                    <span className="has-text-danger">
                        {getLocalizedText("results.resultNotFoundTemplate").format(id)}
                    </span>
                </div>
            </>
        );
    }

    let sessionCaption = "";

    if (item.sessionId === appSession.id) {
        sessionCaption = getLocalizedText("shared.sessionSelector.current");
    } else {
        const session = sessions.find(({ id }) => id === item.sessionId);

        sessionCaption = isNullish(session)
            ? item.sessionId
            : `[${item.sessionId.substring(0, 8)}] ${moment(session.startedAt).format("DD.MM HH:mm")
            } - ${isNullish(session.canceledAt)
                ? "???"
                : moment(session.canceledAt).format("DD.MM HH:mm")
            }`;
    }

    if (isNullOrUndefined(item.startedOn)) {
        return (
            <>
                <Button
                    type="ghost"
                    onClick={onBackClick}
                    className="p-0 is-italic"
                    icon={{ name: "arrow-left-short" }}
                    caption={getLocalizedText("common.back")}
                />
                <div>
                    <h4 className="subtitle is-4">
                        {getLocalizedText("results.resultCaptionTemplate").format(item.shortId)}
                    </h4>
                    <Text
                        disabled
                        onValueChange={emptyFn}
                        defaultValue={sessionCaption}
                        label={{ caption: getLocalizedText("common.session"), horizontal: true }}
                    />
                    <Text
                        disabled
                        onValueChange={emptyFn}
                        defaultValue={getActionDescription(item.action)}
                        label={{ caption: getLocalizedText("common.action"), horizontal: true }}
                    />
                    <Text
                        disabled
                        onValueChange={emptyFn}
                        defaultValue={item.createdOn.format("HH:mm:ss.SSS")}
                        label={{ caption: getLocalizedText("common.createdOn"), horizontal: true }}
                    />
                    <span className="mr-1">
                        {getLocalizedText("results.operationDidNotStarted")}:
                        <br />
                    </span>
                    <span className="has-text-danger">
                        {item.error}
                    </span>
                </div>
            </>
        );
    }

    return (
        <>
            <Button
                type="ghost"
                onClick={onBackClick}
                className="p-0 is-italic"
                icon={{ name: "arrow-left-short" }}
                caption={getLocalizedText("common.back")}
            />
            <section role="results">
                <h4 className="subtitle is-4">
                    {getLocalizedText("results.resultCaptionTemplate").format(item.shortId)}
                </h4>
                <Text
                    key={`${id}-session`}

                    disabled
                    onValueChange={emptyFn}
                    defaultValue={sessionCaption}
                    label={{ caption: getLocalizedText("common.session"), horizontal: true }}
                />
                <Text
                    key={`${id}-action`}

                    disabled
                    onValueChange={emptyFn}
                    defaultValue={getActionDescription(item.action)}
                    label={{ caption: getLocalizedText("common.action"), horizontal: true }}
                />
                <Text
                    key={`${id}-startedOn`}

                    disabled
                    onValueChange={emptyFn}
                    defaultValue={item.startedOn.format("HH:mm:ss")}
                    label={{ caption: getLocalizedText("results.startedOn"), horizontal: true }}
                />
                {!isNullOrUndefined(item.error) &&
                    <Multiline
                        key={`${id}-error`}

                        rows={2}
                        disabled
                        onValueChange={emptyFn}
                        defaultValue={item.error}
                        label={{ caption: getLocalizedText("common.error"), horizontal: true }}
                    />
                }
                {!isNullOrUndefined(item.completedOn) &&
                    <Text
                        key={`${id}-completedOn`}
                        disabled
                        onValueChange={emptyFn}
                        defaultValue={`${item.completedOn.format("HH:mm:ss")} (${item.duration})`}
                        label={{ caption: getLocalizedText("results.completedOn"), horizontal: true }}
                    />
                }
                {!isNullOrUndefined(item.result) &&
                    <>
                        {item.result.status === ActionResultState.cancelled &&
                            <article className="message is-warning mb-0 mt-5">
                                <div className="message-body">
                                    <Icon
                                        name="x-circle"
                                        className="mr-2"
                                    /> {getLocalizedText("results.youHaveAbortedExecution")}
                                </div>
                            </article>
                        }
                        <hr />
                        <ResultDisplay
                            projects={projects}
                            action={item.action}
                            result={item.result}
                            parameters={item.parameters}
                        />
                    </>
                }
            </section>
        </>
    );
};

export default connect(
    ({ app, gitlab }: GlobalAppState) => ({
        items: gitlab.operationsResults,
        projects: gitlab.projects,
        sessions: app.appHistory.sessions,
    } as Partial<OperationResultProps>),
    {}
)(OperationResult);
