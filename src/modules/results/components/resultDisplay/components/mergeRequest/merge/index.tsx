import { FC, useMemo } from "react";

import { emptyFn } from "@bodynarf/utils";
import { ElementColor } from "@bodynarf/react.components";
import Accordion from "@bodynarf/react.components/components/accordion";
import CheckBox from "@bodynarf/react.components/components/primitives/checkbox/component";
import Text from "@bodynarf/react.components/components/primitives/text";

import { MergeRequestParameters, MergeRequestActionResult, MergeRequestError } from "@app/models";

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
                label={{ caption: "MR name", horizontal: true }}
            />
            <CheckBox
                disabled
                isFormLabel
                fixBackgroundColor
                onValueChange={emptyFn}
                style={ElementColor.Link}
                defaultValue={parameters.removeBranch}
                label={{ caption: "Delete source branch after", horizontal: true }}
            />
            <section>
                <Accordion
                    caption={`Merged requests (${result.merged.length})`}
                    defaultExpanded
                >
                    {result.merged.length === 0
                        ? <span className="has-text-grey has-text-wrapped has-text-centered">
                            No requests were merged! 😥
                        </span>
                        : <ul>
                            {result.merged.map(x =>
                                <ResultListItem
                                    key={x}
                                    projectId={x}
                                    text="Merge request merged"
                                    project={projects.get(x)}
                                />
                            )}
                        </ul>

                    }
                </Accordion>

                <Accordion
                    caption={`Ambiguity requests (${result.ambiguityItems.length})`}
                    defaultExpanded
                >
                    {result.ambiguityItems.length === 0
                        ? <span className="has-text-grey has-text-wrapped has-text-centered">
                            No ambiguity requests!
                        </span>
                        : <ul>
                            {result.ambiguityItems.map(x =>
                                <ResultListItem
                                    key={x.projectId}
                                    projectId={x.projectId}
                                    text={`There's ${x.requestsCount} requests with that name in project`}
                                    project={projects.get(x.projectId)}
                                />
                            )}
                        </ul>

                    }
                </Accordion>

                <Accordion
                    defaultExpanded={result.errors.length > 0}
                    caption={`Errors (${result.errors.length})`}
                >
                    {result.errors.length === 0
                        ? <span className="has-text-grey has-text-wrapped has-text-centered">
                            No errors! Hooray! 🎉
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
