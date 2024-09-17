import { FC, useCallback } from "react";

import { emptyFn } from "@bodynarf/utils";
import Accordion from "@bodynarf/react.components/components/accordion";
import Text from "@bodynarf/react.components/components/primitives/text";

import { CheckDiffsActionResult, CheckDiffsParameters, Project } from "@app/models";

import { ActionResultDisplayProps } from "../../component";
import CopyToClipboardButton from "../copyToClipboardBtn";
import AnchorToProject from "../anchorToProject";

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
            `Check-diff "${parameters.source}" => "${parameters.target}" results:\n\n${combinedData
                .map(x => {
                    const projectLink = getProjectJiraRef(x.projectId);

                    return `- ${projectLink}: ${x.hasDiffs ? "there some diffs" : "no diffs"}`;
                })
                .join("\n")
            }`
        );
    }, [combinedData, getProjectJiraRef, parameters.source, parameters.target]);

    const onCopyErrorsClick = useCallback(() => {
        navigator.clipboard.writeText(
            `Check-diff "${parameters.source}" => "${parameters.target}" errors:\n\n${result.errors
                .map(([projectId, error]) => {
                    const projectLink = getProjectJiraRef(projectId);

                    return `- ${projectLink}: Error "${error}"`;
                })
                .join("\n")
            }`
        );
    }, [getProjectJiraRef, parameters.source, parameters.target, result.errors]);

    return (
        <section>
            <Text
                disabled
                onValueChange={emptyFn}
                defaultValue={parameters.source}
                label={{ caption: "From", horizontal: true }}
            />
            <Text
                disabled
                onValueChange={emptyFn}
                defaultValue={parameters.target}
                label={{ caption: "To", horizontal: true }}
            />
            <hr />
            <section>
                <Accordion
                    caption={`Diffs result (${combinedData.length})`}
                    defaultExpanded
                >
                    {combinedData.length === 0
                        ? <span className="has-text-grey has-text-wrapped has-text-centered">
                            No successfully completed &apos;check-diff&apos; operations! So sad! 😥
                        </span>
                        : <>
                            <div className="top-right-btn-wrapper">
                                <div>
                                    <CopyToClipboardButton
                                        onClick={onCopyResultClick}
                                        title="Copy to clipboard for JIRA"
                                    />
                                </div>
                            </div>
                            <ul>
                                {combinedData.map(x =>
                                    <DiffResultListItem
                                        key={x.projectId}
                                        important={x.hasDiffs}
                                        projectId={x.projectId}
                                        project={projects.get(x.projectId)}
                                        text={x.hasDiffs ? "Has diffs" : "No diffs"}
                                    />
                                )}
                            </ul>
                        </>
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
                        : <>
                            <div className="top-right-btn-wrapper">
                                <div>
                                    <CopyToClipboardButton
                                        onClick={onCopyErrorsClick}
                                        title="Copy to clipboard for JIRA"
                                    />
                                </div>
                            </div>
                            <ul>
                                {result.errors.map(([projectId, error]) =>
                                    <DiffResultListItem
                                        key={projectId}

                                        important
                                        text={error}
                                        projectId={projectId}
                                        project={projects.get(projectId)}
                                    />
                                )}
                            </ul>
                        </>
                    }
                </Accordion>
            </section>
        </section>
    );
};

export default CheckDiffsResultDisplay;

/** Props of `DiffResultListItem` */
type DiffResultListItemProps = {
    /** Description message */
    text: string;

    /** Item text should be red colored */
    important: boolean;

    /** Related project entity */
    project: Project;

    /** Related project identifier */
    projectId: number;
};

/** Single list item of result list */
const DiffResultListItem: FC<DiffResultListItemProps> = ({
    project, projectId, text, important,
}) => {
    return (
        <li>
            <span>
                <AnchorToProject
                    project={project}
                    projectId={projectId}
                />: <span
                    className={important ? "has-text-danger" : undefined}
                >
                    {text}
                </span>
            </span>
        </li>
    );
};
