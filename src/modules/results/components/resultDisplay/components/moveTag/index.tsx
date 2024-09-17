import { FC, useCallback } from "react";

import { emptyFn, isNullOrUndefined } from "@bodynarf/utils";
import Accordion from "@bodynarf/react.components/components/accordion";
import Anchor from "@bodynarf/react.components/components/anchor";
import CheckBox from "@bodynarf/react.components/components/primitives/checkbox/component";
import Text from "@bodynarf/react.components/components/primitives/text";

import { MoveTagActionResult, MoveTagParameters, MovedTagInfo, NotMovedTagInfo, Project } from "@app/models";

import { ActionResultDisplayProps } from "../../component";
import CopyToClipboardButton from "../copyToClipboardBtn";
import AnchorToProject from "../anchorToProject";

/** Props type of `MoveTagResultDisplay` */
type MoveTagResultDisplayProps = ActionResultDisplayProps<MoveTagActionResult, MoveTagParameters>;

/** MoveTag operation result display component */
const MoveTagResultDisplay: FC<MoveTagResultDisplayProps> = ({
    projects, result, parameters, getProjectJiraRef,
}) => {
    const onCopyNotMovedClick = useCallback(() => {
        navigator.clipboard.writeText(
            `Not moved tags "${parameters.name}":\n\n${result.notMovedTags
                .map(x => {
                    const projectLink = getProjectJiraRef(x.projectId);

                    return `- ${projectLink}: Tag was not moved: "${x.reason}"`;
                })
                .join("\n")
            }`
        );
    }, [getProjectJiraRef, parameters.name, result.notMovedTags]);

    const onCopyMovedClick = useCallback(() => {
        navigator.clipboard.writeText(
            `Moved tags "${parameters.name}":\n\n${result.notMovedTags
                .map(x => {
                    const projectLink = getProjectJiraRef(x.projectId);

                    return `- ${projectLink}: Tag was moved to latest commit on master branch "[${x.sha}|${x.link}]"`;
                })
                .join("\n")
            }`
        );
    }, [getProjectJiraRef, parameters.name, result.notMovedTags]);

    return (
        <section>
            <Text
                disabled
                onValueChange={emptyFn}
                defaultValue={parameters.name}
                label={{ caption: "Tag name", horizontal: true }}
            />
            <CheckBox
                disabled
                isFormLabel
                onValueChange={emptyFn}
                defaultValue={parameters.createIfNotExist}
                label={{ caption: "Create tag if not exist", horizontal: true }}
            />
            <hr />
            <Accordion
                defaultExpanded={result.notMovedTags.length > 0}
                caption={`Not moved tags (${result.notMovedTags.length})`}
            >
                {result.notMovedTags.length === 0 &&
                    <p className="is-italic has-text-grey pb-2">
                        All tag&apos;s were moved! Hooray! 🎉
                    </p>
                }
                {result.notMovedTags.length > 0 &&
                    <>
                        <div className="top-right-btn-wrapper">
                            <div>
                                <CopyToClipboardButton
                                    onClick={onCopyNotMovedClick}
                                    title="Copy to clipboard for JIRA"
                                />
                            </div>
                        </div>
                        <p className="is-italic has-text-grey pb-2">
                            These tags have not been moved. Please check each tag manually
                        </p>
                        <ul>
                            {result.notMovedTags.map(x =>
                                <TagResultInfo
                                    key={x.projectId}

                                    notMovedTag={x}
                                    projectId={x.projectId}
                                    project={projects.get(x.projectId)}
                                />
                            )}
                        </ul>
                    </>
                }
            </Accordion>
            <Accordion caption={`Moved tags (${result.movedTags.length})`}>
                {result.movedTags.length === 0 &&
                    <p className="is-italic has-text-grey pb-2">
                        No tag&apos;s were moved! So sad! 😥
                    </p>
                }
                {result.movedTags.length > 0 &&
                    <>
                        <div className="top-right-btn-wrapper">
                            <div>
                                <CopyToClipboardButton
                                    onClick={onCopyMovedClick}
                                    title="Copy to clipboard for JIRA"
                                />
                            </div>
                        </div>
                        <ul>
                            {result.movedTags.map(x =>
                                <TagResultInfo
                                    key={x.sha}
                                    movedTag={x}
                                    projectId={x.projectId}
                                    project={projects.get(x.projectId)}
                                />
                            )}
                        </ul>
                    </>
                }

            </Accordion>

        </section>
    );
};

export default MoveTagResultDisplay;

type TagResultInfoProps = {
    /** Related project entity */
    project: Project;

    /** Related project identifier */
    projectId: number;

    /** Moved tag information */
    movedTag?: MovedTagInfo;

    /** Not moved tag information */
    notMovedTag?: NotMovedTagInfo;
};

/**
 * Single merge request information component
 * @param param0 Component props
 * @returns Component as template
 */
const TagResultInfo: FC<TagResultInfoProps> = ({
    project, projectId, movedTag, notMovedTag,
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
                    />: Tag was not moved: <span className="has-text-danger">
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
                />: Tag was moved to latest commit on master branch &quot;<Anchor
                    target="_blank"
                    href={movedTag.link}
                    className="is-underlined"
                    caption={movedTag.sha}
                />&quot;
            </span>
        </li>
    );
};
