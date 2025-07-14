import { FC, useMemo } from "react";

import { emptyFn } from "@bodynarf/utils";
import { ElementColor } from "@bodynarf/react.components";
import Accordion from "@bodynarf/react.components/components/accordion";
import CheckBox from "@bodynarf/react.components/components/primitives/checkbox/component";
import Text from "@bodynarf/react.components/components/primitives/text";

import { MergeRequestParameters, MergeRequestActionResult, MergeRequestError } from "@app/models";
import { getLocalizedText } from "@app/locale";

import { ActionResultDisplayProps } from "../../../component";

import { ResultListItem } from "../../shared/resultListItem";

/** Props type of `MergeRequestResultDisplay` */
type MergeRequestResultDisplayProps = ActionResultDisplayProps<MergeRequestActionResult, MergeRequestParameters>;

/** MergeRequest operation result display component */
const MergeRequestResultDisplay: FC<MergeRequestResultDisplayProps> = ({
    result, parameters, projects
}) => {
    const errors = useMemo(() => result.errors.groupBy<MergeRequestError>("type"), [result.errors]);

    return (
        <section role="close-merge-request-results">
            <Text
                disabled
                onValueChange={emptyFn}
                defaultValue={parameters.requestName}
                label={{ caption: getLocalizedText("parameters.requestName"), horizontal: true }}
            />
            <CheckBox
                disabled
                isFormLabel
                fixBackgroundColor
                onValueChange={emptyFn}
                style={ElementColor.Link}
                defaultValue={parameters.removeBranch}
                label={{ caption: getLocalizedText("parameters.mergeRequest.deleteBranchAfter"), horizontal: true }}
            />
            <section>
                <Accordion
                    defaultExpanded
                    caption={`${getLocalizedText("results.mergeRequest.mergedRequests")} (${result.merged.length})`}
                >
                    {result.merged.length === 0
                        ? <span className="has-text-grey has-text-wrapped has-text-centered">
                            {getLocalizedText("results.mergeRequest.noMergedRequests")}
                        </span>
                        : <ul>
                            {result.merged.map(x =>
                                <ResultListItem
                                    key={x}
                                    projectId={x}
                                    project={projects.get(x)}
                                    text={getLocalizedText("results.mergeRequest.merge.requestMerged")}
                                />
                            )}
                        </ul>

                    }
                </Accordion>

                <Accordion
                    defaultExpanded
                    caption={`${getLocalizedText("results.mergeRequest.ambiguityCaption")} (${result.ambiguityItems.length})`}
                >
                    {result.ambiguityItems.length === 0
                        ? <span className="has-text-grey has-text-wrapped has-text-centered">
                            {getLocalizedText("results.mergeRequest.noAmbiguityMessage")}
                        </span>
                        : <ul>
                            {result.ambiguityItems.map(x =>
                                <ResultListItem
                                    key={x.projectId}
                                    projectId={x.projectId}
                                    project={projects.get(x.projectId)}
                                    text={getLocalizedText("results.mergeRequest.ambiguityItemTemplate").format(`${x.requestsCount}`)}
                                />
                            )}
                        </ul>

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
                        : <ul>
                            {errors.map(({ items }, index) =>
                                <>
                                    {items.map(x =>
                                        <ResultListItem
                                            key={x.projectId}

                                            isError
                                            text={x.message}
                                            projectId={x.projectId}
                                            project={projects.get(x.projectId)}
                                        />
                                    )}
                                    {index !== errors.length - 1 &&
                                        <li>
                                            <br />
                                        </li>
                                    }
                                </>
                            )}
                        </ul>
                    }
                </Accordion>
            </section>
        </section>
    );
};

export default MergeRequestResultDisplay;
