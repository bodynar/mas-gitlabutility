import { FC, useCallback } from "react";

import { emptyFn } from "@bodynarf/utils";
import { ElementColor } from "@bodynarf/react.components";
import Accordion from "@bodynarf/react.components/components/accordion";
import Anchor from "@bodynarf/react.components/components/anchor";
import CheckBox from "@bodynarf/react.components/components/primitives/checkbox/component";
import Text from "@bodynarf/react.components/components/primitives/text";

import { ReleaseParameters, ReleaseActionResult } from "@app/models";
import { getLocalizedText } from "@app/locale";

import { ActionResultDisplayProps } from "../../../component";

import MergeRequestsLists from "../../shared/mergeRequestsLists";
import CopyToClipboardButton from "../../shared/copyToClipboardBtn";
import AnchorToProject from "../../shared/anchorToProject";

/** Props type of `ReleaseResultDisplay` */
type ReleaseResultDisplayProps = ActionResultDisplayProps<ReleaseActionResult, ReleaseParameters>;

/** Release operation result display component */
const ReleaseResultDisplay: FC<ReleaseResultDisplayProps> = ({
    result, parameters, projects, getProjectJiraRef
}) => {
    const onCopyClick = useCallback(() => {
        navigator.clipboard.writeText(
            getLocalizedText("results.streamMerge.release.createdTags")
            + ":\n\n"
            + result.createdTags
                .map(x => {
                    const projectLink = getProjectJiraRef(x.projectId);
                    return getLocalizedText("results.streamMerge.release.createdTagItemTemplate").format(
                        projectLink,
                        parameters.version,
                        x.link,
                        x.markOnly
                            ? "(" + getLocalizedText("results.streamMerge.release.withoutMr") + ")"
                            : ""
                    );
                })
                .join("\n")
        );
    }, [getProjectJiraRef, parameters.version, result.createdTags]);

    return (
        <section role="release-results">
            <Text
                disabled
                onValueChange={emptyFn}
                defaultValue={parameters.testBranch}
                label={{ caption: getLocalizedText("parameters.streamMerge.release.testBranch"), horizontal: true }}
            />
            <Text
                disabled
                onValueChange={emptyFn}
                defaultValue={parameters.productionBranch}
                label={{ caption: getLocalizedText("parameters.streamMerge.release.productiveBranch"), horizontal: true }}
            />
            <Text
                disabled
                onValueChange={emptyFn}
                defaultValue={parameters.version}
                label={{ caption: getLocalizedText("parameters.streamMerge.release.version"), horizontal: true }}
            />
            <CheckBox
                disabled
                isFormLabel
                fixBackgroundColor
                onValueChange={emptyFn}
                style={ElementColor.Link}
                defaultValue={parameters.setVersionTagAfter}
                label={{ caption: getLocalizedText("parameters.streamMerge.release.setVersionTagOnMergeCommit"), horizontal: true }}
            />
            <Text
                disabled
                onValueChange={emptyFn}
                defaultValue={parameters.mergeRequestName}
                label={{ caption: getLocalizedText("parameters.requestName"), horizontal: true }}
            />
            {parameters.setVersionTagAfter &&
                <Accordion
                    defaultExpanded
                    caption={`${getLocalizedText("results.streamMerge.release.createdTags")} (${result.createdTags.length})`}
                >
                    {result.createdTags.length === 0 &&
                        <p className="is-italic has-text-grey pb-2">
                            {getLocalizedText("results.streamMerge.release.noCreatedTags")}
                        </p>
                    }
                    {result.createdTags.length > 0 &&
                        <>
                            <ul>
                                {result.createdTags.map(x =>
                                    <li
                                        key={x.link}
                                    >
                                        <span>
                                            <AnchorToProject
                                                projectId={x.projectId}
                                                project={projects.get(x.projectId)}
                                            />: {getLocalizedText("results.streamMerge.release.tag")} &quot;<Anchor
                                                href={x.link}
                                                target="_blank"
                                                className="is-underlined"
                                                caption={parameters.version}
                                            />&quot; {x.markOnly && <span className="is-italic has-text-grey">({
                                                getLocalizedText("results.streamMerge.release.withoutMr")
                                            })</span>}
                                        </span>
                                    </li>
                                )}
                            </ul>
                            <CopyToClipboardButton
                                onClick={onCopyClick}
                                title={getLocalizedText("results.copyToClipboard")}
                            />
                        </>
                    }
                </Accordion>
            }
            <MergeRequestsLists
                projects={projects}
                mergedRequests={result.mergedRequests}
                notMergedRequests={result.notMergedRequests}
                getProjectJiraRef={getProjectJiraRef}
            />
        </section>
    );
};

export default ReleaseResultDisplay;
