import { FC, useCallback } from "react";

import { emptyFn } from "@bodynarf/utils";
import Accordion from "@bodynarf/react.components/components/accordion";
import Text from "@bodynarf/react.components/components/primitives/text";

import { CheckDiffsActionResult, CheckDiffsParameters } from "@app/models";
import { getLocalizedText } from "@app/locale";

import { ActionResultDisplayProps } from "../../../component";
import CopyToClipboardButton from "../../shared/copyToClipboardBtn";
import { ResultListItem } from "../../shared/resultListItem";

/** Props type of `CheckDiffsResultDisplay` */
type CheckDiffsResultDisplayProps = ActionResultDisplayProps<CheckDiffsActionResult, CheckDiffsParameters>;

/** Check diffs operation result display component */
const CheckDiffsResultDisplay: FC<CheckDiffsResultDisplayProps> = ({
    result, parameters, projects, getProjectJiraRef,
}) => {
    const combinedData =
        result.hasDiffs
            .map(x => ({ projectId: x, hasDiffs: true }))
            .concat(
                result.noDiffs.map(x => ({ projectId: x, hasDiffs: false }))
            );

    const onCopyResultClick = useCallback(() => {
        navigator.clipboard.writeText(
            getLocalizedText("results.branch.checkDiffs.caption")
            + ` "${parameters.source}" => "${parameters.target}": `
            + getLocalizedText("results.results")
            + ":\n\n"
            + combinedData
                .map(x => {
                    const projectLink = getProjectJiraRef(x.projectId);

                    return `- ${projectLink}: ${getLocalizedText(x.hasDiffs
                        ? "results.branch.checkDiffs.hasDiffs" : "results.branch.checkDiffs.noDiffs"
                    )}`;
                })
                .join("\n")
        );
    }, [combinedData, getProjectJiraRef, parameters.source, parameters.target]);

    const onCopyErrorsClick = useCallback(() => {
        navigator.clipboard.writeText(
            getLocalizedText("results.branch.checkDiffs.caption")
            + ` "${parameters.source}" => "${parameters.target}": `
            + getLocalizedText("results.errors")
            + ":\n\n"
            + result.errors
                .map(([projectId, error]) => {
                    const projectLink = getProjectJiraRef(projectId);

                    return `- ${projectLink}: ${getLocalizedText("common.error")} "${error}"`;
                })
                .join("\n")
        );
    }, [getProjectJiraRef, parameters.source, parameters.target, result.errors]);

    return (
        <section>
            <Text
                disabled
                onValueChange={emptyFn}
                defaultValue={parameters.source}
                label={{ caption: getLocalizedText("parameters.from"), horizontal: true }}
            />
            <Text
                disabled
                onValueChange={emptyFn}
                defaultValue={parameters.target}
                label={{ caption: getLocalizedText("parameters.to"), horizontal: true }}
            />
            <hr />
            <section>
                <Accordion
                    defaultExpanded
                    caption={`${getLocalizedText("results.branch.checkDiffs.successCaption")} (${combinedData.length})`}
                >
                    {combinedData.length === 0
                        ? <span className="has-text-grey has-text-wrapped has-text-centered">
                            {getLocalizedText("results.branch.checkDiffs.noSuccessCaption")}
                        </span>
                        : <>
                            <ul>
                                {combinedData.map(x =>
                                    <ResultListItem
                                        key={x.projectId}
                                        isError={x.hasDiffs}
                                        projectId={x.projectId}
                                        project={projects.get(x.projectId)}
                                        text={getLocalizedText(x.hasDiffs
                                            ? "results.branch.checkDiffs.hasDiffs"
                                            : "results.branch.checkDiffs.noDiffs"
                                        )}
                                    />
                                )}
                            </ul>
                            <CopyToClipboardButton
                                onClick={onCopyResultClick}
                                title={getLocalizedText("results.copyToClipboard")}
                            />
                        </>
                    }
                </Accordion>

                <Accordion
                    defaultExpanded={result.errors.length > 0}
                    caption={`${getLocalizedText("common.errors")} (${result.errors.length})`}
                >
                    {result.errors.length === 0
                        ? <span className="has-text-grey has-text-wrapped has-text-centered">
                            {getLocalizedText("results.noErrorsCaption")}
                        </span>
                        : <>
                            <ul>
                                {result.errors.map(([projectId, error]) =>
                                    <ResultListItem
                                        key={projectId}

                                        isError
                                        text={error}
                                        projectId={projectId}
                                        project={projects.get(projectId)}
                                    />
                                )}
                            </ul>
                            <CopyToClipboardButton
                                onClick={onCopyErrorsClick}
                                title={getLocalizedText("results.copyToClipboard")}
                            />
                        </>
                    }
                </Accordion>
            </section>
        </section>
    );
};

export default CheckDiffsResultDisplay;
