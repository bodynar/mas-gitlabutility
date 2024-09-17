import { FC, useCallback } from "react";

import { emptyFn } from "@bodynarf/utils";
import Accordion from "@bodynarf/react.components/components/accordion";
import Anchor from "@bodynarf/react.components/components/anchor";
import Text from "@bodynarf/react.components/components/primitives/text";

import { CheckNonActualTagsActionResult, CheckNonActualTagsParameters, Project } from "@app/models";

import { ActionResultDisplayProps } from "../../component";
import CopyToClipboardButton from "../copyToClipboardBtn";
import AnchorToProject from "../anchorToProject";

/** Props type of `CheckNonActualTags` */
type CheckNonActualTagsProps = ActionResultDisplayProps<CheckNonActualTagsActionResult, CheckNonActualTagsParameters>;

/** CheckNonActualTags operation result display component */
const CheckNonActualTags: FC<CheckNonActualTagsProps> = ({
    projects,
    result, parameters, getProjectJiraRef,
}) => {
    const onCopyNonActualClick = useCallback(() => {
        navigator.clipboard.writeText(
            `Not actual tags "${parameters.name}":\n\n${result.nonActual
                .map(x => {
                    const projectLink = getProjectJiraRef(x.projectId);

                    return `- ${projectLink}: [Tag|${x.commitLink}] is not on [last commit|${x.latestCommitLink}]`;
                })
                .join("\n")
            }`
        );
    }, [getProjectJiraRef, parameters.name, result.nonActual]);

    const onCopyActualClick = useCallback(() => {
        navigator.clipboard.writeText(
            `Actual tags "${parameters.name}":\n\n${result.actual
                .map(x => {
                    const projectLink = getProjectJiraRef(x);

                    return `- ${projectLink}: Tag is on latest commit`;
                })
                .join("\n")
            }`
        );
    }, [getProjectJiraRef, parameters.name, result.actual]);

    const onCopyErrorsActualClick = useCallback(() => {
        navigator.clipboard.writeText(
            `Errors during checking actuality of tag "${parameters.name}":\n\n${result.errors
                .map(([projectId, error]) => {
                    const projectLink = getProjectJiraRef(projectId);

                    return `- ${projectLink}: ${error}`;
                })
                .join("\n")
            }`
        );
    }, [getProjectJiraRef, parameters.name, result.errors]);

    return (
        <section>
            <Text
                disabled
                onValueChange={emptyFn}
                defaultValue={parameters.name}
                label={{ caption: "Tag name", horizontal: true }}
            />
            <hr />
            <section>
                <Accordion
                    caption={`Not actual tags (${result.nonActual.length})`}
                    defaultExpanded
                >
                    {result.nonActual.length === 0
                        ? <span className="has-text-grey has-text-wrapped has-text-centered">
                            Non actual were&apos;nt tags found
                        </span>
                        : <>
                            <div className="top-right-btn-wrapper">
                                <div>
                                    <CopyToClipboardButton
                                        onClick={onCopyNonActualClick}
                                        title="Copy to clipboard for JIRA"
                                    />
                                </div>
                            </div>
                            <ul>
                                {result.nonActual.map(x =>
                                    <NonActualTagInfo
                                        key={x.projectId}
                                        projectId={x.projectId}
                                        commitLink={x.commitLink}
                                        project={projects.get(x.projectId)}
                                        latestCommitLink={x.latestCommitLink}
                                    />
                                )}
                            </ul>
                        </>
                    }
                </Accordion>

                <Accordion caption={`Actual tags (${result.actual.length})`}>
                    {result.actual.length === 0
                        ? <span className="has-text-grey has-text-wrapped has-text-centered">
                            No tags that are actual found 😥
                        </span>
                        :
                        <>
                            <div className="top-right-btn-wrapper">
                                <div>
                                    <CopyToClipboardButton
                                        onClick={onCopyActualClick}
                                        title="Copy to clipboard for JIRA"
                                    />
                                </div>
                            </div>
                            <ul>
                                {result.actual.map(x =>
                                    <DiffResultListItem
                                        key={x}
                                        error={false}
                                        projectId={x}
                                        project={projects.get(x)}
                                        text="Tag is on latest commit"
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
                                        onClick={onCopyErrorsActualClick}
                                        title="Copy to clipboard for JIRA"
                                    />
                                </div>
                            </div>
                            <ul>
                                {result.errors.map(([projectId, error]) =>
                                    <DiffResultListItem
                                        error
                                        text={error}
                                        key={projectId}
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

export default CheckNonActualTags;

/** Props of `DiffResultListItem` */
type DiffResultListItemProps = {
    /** Related project entity */
    project: Project;

    /** Related project identifier */
    projectId: number;

    /** Description message */
    text: string;

    /** Is error item */
    error: boolean;
};

/** Single list item of result list */
const DiffResultListItem: FC<DiffResultListItemProps> = ({
    project, projectId, text, error,
}) => {
    return (
        <li>
            <span>
                <AnchorToProject
                    project={project}
                    projectId={projectId}
                />: <span
                    className={error ? "has-text-danger" : undefined}
                >
                    {text}
                </span>
            </span>
        </li>
    );
};

/** Props of `NonActualTagInfo` */
type NonActualTagInfoProps = {
    /** Related project entity */
    project: Project;

    /** Related project identifier */
    projectId: number;

    /** Link to commit with tag */
    commitLink: string;

    /** Link to latest commit on master branch */
    latestCommitLink: string;
};

/** Single list item of non actual tag list */
const NonActualTagInfo: FC<NonActualTagInfoProps> = ({
    project, projectId, commitLink, latestCommitLink
}) => {
    return (
        <li key={projectId}>
            <span>
                <AnchorToProject
                    project={project}
                    projectId={projectId}
                />: <Anchor
                    caption="Tag"
                    target="_blank"
                    href={commitLink}
                    className="is-underlined"
                /> is not on <Anchor
                    target="_blank"
                    caption="last commit"
                    className="is-underlined has-text-danger"
                    href={latestCommitLink}
                />
            </span>
        </li>
    );
};
