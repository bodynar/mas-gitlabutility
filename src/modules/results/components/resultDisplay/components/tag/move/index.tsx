import { FC, useCallback, useMemo } from "react";

import { emptyFn, isNullOrUndefined } from "@bodynarf/utils";
import Accordion from "@bodynarf/react.components/components/accordion";
import Anchor from "@bodynarf/react.components/components/anchor";
import CheckBox from "@bodynarf/react.components/components/primitives/checkbox/component";
import Text from "@bodynarf/react.components/components/primitives/text";

import { MoveTagActionResult, MoveTagParameters, MovedTagInfo, NotMovedTagInfo, Project } from "@app/models";
import { getLocalizedText } from "@app/locale";

import { ActionResultDisplayProps } from "../../../component";
import CopyToClipboardButton from "../../shared/copyToClipboardBtn";
import AnchorToProject from "../../shared/anchorToProject";

/** Props type of `MoveTagResultDisplay` */
type MoveTagResultDisplayProps = ActionResultDisplayProps<MoveTagActionResult, MoveTagParameters>;

/** MoveTag operation result display component */
const MoveTagResultDisplay: FC<MoveTagResultDisplayProps> = ({
    projects, result, parameters, getProjectJiraRef,
}) => {
    const onCopyNotMovedClick = useCallback(() => {
        navigator.clipboard.writeText(
            getLocalizedText("results.tag.move.notMovedTags")
            + ` "${parameters.name}":\n\n`
            + result.notMovedTags
                .map(x => {
                    const projectLink = getProjectJiraRef(x.projectId);

                    return getLocalizedText("results.tag.move.copyNotMovedTagsItemTemplate").format(projectLink, x.reason);
                })
                .join("\n")
        );
    }, [getProjectJiraRef, parameters.name, result.notMovedTags]);

    const onCopyMovedClick = useCallback(() => {
        navigator.clipboard.writeText(
            getLocalizedText("results.tag.move.movedTags")
            + ` "${parameters.name}":\n\n`
            + result.movedTags
                .map(x => {
                    const projectLink = getProjectJiraRef(x.projectId);

                    return getLocalizedText("results.tag.move.copyMovedTagsItemTemplate")
                        .format(
                            projectLink,
                            parameters.branch,
                            x.sha,
                            x.link
                        );
                })
                .join("\n")
        );
    }, [getProjectJiraRef, parameters.branch, parameters.name, result.movedTags]);

    const errors = useMemo(() => result.notMovedTags.groupBy<NotMovedTagInfo>("reasonType"), [result.notMovedTags]);

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
            <CheckBox
                disabled
                isFormLabel
                onValueChange={emptyFn}
                defaultValue={parameters.createIfNotExist}
                label={{ caption: getLocalizedText("parameters.tag.move.createTagIfNotExist"), horizontal: true }}
            />
            <hr />
            <Accordion
                defaultExpanded={result.notMovedTags.length > 0}
                caption={`${getLocalizedText("results.tag.move.notMovedTags")} (${result.notMovedTags.length})`}
            >
                {result.notMovedTags.length === 0 &&
                    <p className="is-italic has-text-grey pb-2">
                        {getLocalizedText("results.tag.move.notMovedTagsEmpty")}
                    </p>
                }
                {result.notMovedTags.length > 0 &&
                    <>
                        <div>
                            <p className="is-italic has-text-grey pb-2">
                                {getLocalizedText("results.tag.move.notMovedTagsNote")}
                            </p>
                            <ul>
                                {errors.map(({ items }, index) =>
                                    <>
                                        {items.map(x =>
                                            <TagResultInfo
                                                key={x.projectId}

                                                notMovedTag={x}
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
                        </div>
                        <CopyToClipboardButton
                            onClick={onCopyNotMovedClick}
                            title={getLocalizedText("results.copyToClipboard")}
                        />
                    </>
                }
            </Accordion>
            <Accordion caption={`${getLocalizedText("results.tag.move.movedTags")} (${result.movedTags.length})`}>
                {result.movedTags.length === 0 &&
                    <p className="is-italic has-text-grey pb-2">
                        {getLocalizedText("results.tag.move.movedTagsEmpty")}
                    </p>
                }
                {result.movedTags.length > 0 &&
                    <>
                        <ul>
                            {result.movedTags.map(x =>
                                <TagResultInfo
                                    key={x.sha}
                                    movedTag={x}
                                    projectId={x.projectId}
                                    branchName={parameters.branch}
                                    project={projects.get(x.projectId)}
                                />
                            )}
                        </ul>
                        <CopyToClipboardButton
                            onClick={onCopyMovedClick}
                            title={getLocalizedText("results.copyToClipboard")}
                        />
                    </>
                }

            </Accordion>

        </section>
    );
};

export default MoveTagResultDisplay;

/** Props type of `TagResultInfo` */
type TagResultInfoProps = {
    /** Related project entity */
    project: Project;

    /** Related project identifier */
    projectId: number;

    /** Moved tag information */
    movedTag?: MovedTagInfo;

    /** Not moved tag information */
    notMovedTag?: NotMovedTagInfo;

    /** Branch name */
    branchName?: string;
};

/**
 * Single merge request information component
 * @param param0 Component props
 * @returns Component as template
 */
const TagResultInfo: FC<TagResultInfoProps> = ({
    project, projectId, movedTag, notMovedTag, branchName
}) => {
    if (isNullOrUndefined(movedTag) && isNullOrUndefined(notMovedTag)) {
        return <></>;
    }

    if (isNullOrUndefined(movedTag)) {
        return (
            <li>
                <span>
                    <AnchorToProject
                        project={project}
                        projectId={projectId}
                    />: {getLocalizedText("results.tag.move.tagWasNotMoved")}: <span className="has-text-danger">
                        {notMovedTag.reason}
                    </span>
                </span>
            </li>
        );
    }

    return (
        <li>
            <span>
                <AnchorToProject
                    project={project}
                    projectId={projectId}
                />: {getLocalizedText("results.tag.move.tagWasMovedToLatestCommitTemplate").format(branchName)} &quot;<Anchor
                    target="_blank"
                    href={movedTag.link}
                    className="is-underlined"
                    caption={movedTag.sha}
                />&quot;
            </span>
        </li>
    );
};
