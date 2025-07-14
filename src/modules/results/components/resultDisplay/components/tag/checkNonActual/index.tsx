import { FC, useCallback, useMemo } from "react";

import { emptyFn } from "@bodynarf/utils";
import Accordion from "@bodynarf/react.components/components/accordion";
import Anchor from "@bodynarf/react.components/components/anchor";
import Text from "@bodynarf/react.components/components/primitives/text";

import { CheckNonActualTagsActionError, CheckNonActualTagsActionResult, CheckNonActualTagsParameters, Project } from "@app/models";
import { getLocalizedText } from "@app/locale";

import { ActionResultDisplayProps } from "../../../component";
import CopyToClipboardButton from "../../shared/copyToClipboardBtn";
import AnchorToProject from "../../shared/anchorToProject";
import { ResultListItem } from "../../shared/resultListItem";

/** Props type of `CheckNonActualTags` */
type CheckNonActualTagsProps = ActionResultDisplayProps<CheckNonActualTagsActionResult, CheckNonActualTagsParameters>;

/** CheckNonActualTags operation result display component */
const CheckNonActualTags: FC<CheckNonActualTagsProps> = ({
    projects,
    result, parameters, getProjectJiraRef,
}) => {
    const errors = useMemo(() => result.errors.groupBy<CheckNonActualTagsActionError>("type"), [result.errors]);

    const onCopyNonActualClick = useCallback(() => {
        navigator.clipboard.writeText(
            getLocalizedText("results.tag.checkNonActual.nonActualTagsCaption")
            + ` "${parameters.name}":\n\n`
            + result.nonActual
                .map(x => {
                    const projectLink = getProjectJiraRef(x.projectId);

                    return getLocalizedText("results.tag.checkNonActual.copyNonActualTagItemTemplate")
                        .format(
                            projectLink,
                            x.commitLink,
                            x.latestCommitLink
                        );
                })
                .join("\n")
        );
    }, [getProjectJiraRef, parameters.name, result.nonActual]);

    const onCopyActualClick = useCallback(() => {
        navigator.clipboard.writeText(
            getLocalizedText("results.tag.checkNonActual.actualTagsCaption")
            + ` "${parameters.name}":\n\n`
            + result.actual
                .map(x => {
                    const projectLink = getProjectJiraRef(x);

                    return getLocalizedText("results.tag.checkNonActual.copyActualTagItemTemplate")
                        .format(projectLink);
                })
                .join("\n")
        );
    }, [getProjectJiraRef, parameters.name, result.actual]);

    const onCopyErrorsActualClick = useCallback(() => {
        navigator.clipboard.writeText(
            getLocalizedText("results.tag.checkNonActual.copyErrorsCaption")
            + ` "${parameters.name}":\n\n`
            + result.errors
                .map(({ projectId, message }) => {
                    const projectLink = getProjectJiraRef(projectId);

                    return getLocalizedText("results.tag.checkNonActual.copyErrorItemTemplate").format(projectLink, message);
                })
                .join("\n")
        );
    }, [getProjectJiraRef, parameters.name, result.errors]);

    return (
        <section>
            <Text
                disabled
                onValueChange={emptyFn}
                defaultValue={parameters.branch}
                label={{ caption: getLocalizedText("parameters.tag.branch"), horizontal: true }}
            />
            <Text
                disabled
                onValueChange={emptyFn}
                defaultValue={parameters.name}
                label={{ caption: getLocalizedText("parameters.tag.tagName"), horizontal: true }}
            />
            <hr />
            <section>
                <Accordion
                    defaultExpanded
                    caption={`${getLocalizedText("results.tag.checkNonActual.nonActualTagsCaption")} (${result.nonActual.length})`}
                >
                    {result.nonActual.length === 0
                        ? <span className="has-text-grey has-text-wrapped has-text-centered">
                            {getLocalizedText("results.tag.checkNonActual.nonActualTagsEmpty")}
                        </span>
                        : <>
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
                            <CopyToClipboardButton
                                onClick={onCopyNonActualClick}
                                title={getLocalizedText("results.copyToClipboard")}
                            />
                        </>
                    }
                </Accordion>

                <Accordion caption={`${getLocalizedText("results.tag.checkNonActual.actualTagsCaption")} (${result.actual.length})`}>
                    {result.actual.length === 0
                        ? <span className="has-text-grey has-text-wrapped has-text-centered">
                            {getLocalizedText("results.tag.checkNonActual.actualTagsEmpty")}
                        </span>
                        :
                        <>
                            <ul>
                                {result.actual.map(x =>
                                    <ResultListItem
                                        key={x}

                                        projectId={x}
                                        project={projects.get(x)}
                                        text={getLocalizedText("results.tag.checkNonActual.tagIsOnLatestCommit")}
                                    />
                                )}
                            </ul>
                            <CopyToClipboardButton
                                onClick={onCopyActualClick}
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
                            <CopyToClipboardButton
                                onClick={onCopyErrorsActualClick}
                                title={getLocalizedText("results.copyToClipboard")}
                            />
                        </>
                    }
                </Accordion>
            </section>
        </section>
    );
};

export default CheckNonActualTags;

/** Props of `NonActualTagInfo` */
type NonActualTagInfoProps = {
    /** Related project entity */
    project: Project;

    /** Related project identifier */
    projectId: number;

    /** Link to commit with tag */
    commitLink: string;

    /** Link to latest commit on branch */
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
                /> {getLocalizedText("results.tag.checkNonActual.isNotOn")} <Anchor
                    target="_blank"
                    caption="last commit"
                    className="is-underlined has-text-danger"
                    href={latestCommitLink}
                />
            </span>
        </li>
    );
};
