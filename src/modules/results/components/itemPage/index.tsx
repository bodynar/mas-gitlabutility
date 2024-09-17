import { FC, useCallback } from "react";
import { connect } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { emptyFn, isNullOrUndefined } from "@bodynarf/utils";
import Button from "@bodynarf/react.components/components/button/component";
import Text from "@bodynarf/react.components/components/primitives/text";
import Multiline from "@bodynarf/react.components/components/primitives/multiline";
import Icon from "@bodynarf/react.components/components/icon";

import { ActionResultState, OperationResult as OperationResultModel, Project, actionToDescriptionMap } from "@app/models";
import { GlobalAppState } from "@app/store";

import ResultDisplay from "../resultDisplay";

/** Props of `OperationResult` */
type OperationResultProps = {
    /** Results of the operations performed */
    items: Array<OperationResultModel<any>>;

    /** Available projects */
    projects: Array<Project>;
};

/** Information about single performed operation display component */
const OperationResult: FC<OperationResultProps> = ({
    items, projects,
}) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const onBackClick = useCallback(() => navigate(-1), [navigate]);

    if (isNullOrUndefined(id)) {
        return (
            <>
                <Button
                    outlined
                    type="info"
                    caption="Back"
                    className="mb-2"
                    onClick={onBackClick}
                />
                <span className="has-text-danger">
                    Operation result identifier is not provided
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
                    caption="Back"
                    onClick={onBackClick}
                    className="p-0 is-italic"
                    icon={{ name: "arrow-left-short" }}
                />
                <div>
                    <span className="has-text-danger">
                        Operation result with identifier &quot;{id}&quot; not found
                    </span>
                </div>
            </>
        );
    }

    if (isNullOrUndefined(item.startedOn)) {
        return (
            <>
                <Button
                    type="ghost"
                    caption="Back"
                    onClick={onBackClick}
                    className="p-0 is-italic"
                    icon={{ name: "arrow-left-short" }}
                />
                <div>
                    <h4 className="subtitle is-4">
                        Operation #{item.shortId} result
                    </h4>
                    <Text
                        disabled
                        onValueChange={emptyFn}
                        defaultValue={actionToDescriptionMap.get(item.action)}
                        label={{ caption: "Action", horizontal: true }}
                    />
                    <Text
                        disabled
                        onValueChange={emptyFn}
                        defaultValue={item.createdOn.format("HH:mm:ss.SSS")}
                        label={{ caption: "Created on", horizontal: true }}
                    />
                    <span className="mr-1">
                        The operation did not start due to an error:<br />
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
                caption="Back"
                onClick={onBackClick}
                className="p-0 is-italic"
                icon={{ name: "arrow-left-short" }}
            />
            <section>
                <h4 className="subtitle is-4">
                    Operation #{item.shortId} result
                </h4>
                <Text
                    disabled
                    onValueChange={emptyFn}
                    defaultValue={actionToDescriptionMap.get(item.action)}
                    label={{ caption: "Action", horizontal: true }}
                />
                <Text
                    disabled
                    onValueChange={emptyFn}
                    defaultValue={item.startedOn.format("HH:mm:ss")}
                    label={{ caption: "Started on", horizontal: true }}
                />
                {!isNullOrUndefined(item.error) &&
                    <Multiline
                        rows={2}
                        disabled
                        onValueChange={emptyFn}
                        defaultValue={item.error}
                        label={{ caption: "Error", horizontal: true }}
                    />
                }
                {!isNullOrUndefined(item.completedOn) &&
                    <Text
                        disabled
                        onValueChange={emptyFn}
                        defaultValue={`${item.completedOn.format("HH:mm:ss")} (${item.completionTime.value} ${item.completionTime.measurement})`}
                        label={{ caption: "Completed on", horizontal: true }}
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
                                    /> You have aborted the execution
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
    ({ gitlab }: GlobalAppState) => ({
        items: gitlab.operationsResults,
        projects: gitlab.projects,
    } as Partial<OperationResultProps>),
    {}
)(OperationResult);
