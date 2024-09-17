import { useCallback } from "react";

import { emptyFn } from "@bodynarf/utils";
import { ElementColor } from "@bodynarf/react.components";
import Accordion from "@bodynarf/react.components/components/accordion";
import Anchor from "@bodynarf/react.components/components/anchor";
import CheckBox from "@bodynarf/react.components/components/primitives/checkbox/component";
import Text from "@bodynarf/react.components/components/primitives/text";

import { ReleaseParameters, ReleaseActionResult } from "@app/models";

import { ActionResultDisplayProps } from "../../component";

import MergeRequestsLists from "../mergeRequestsLists";
import CopyToClipboardButton from "../copyToClipboardBtn";
import AnchorToProject from "../anchorToProject";

/** Props type of `ReleaseResultDisplay` */
type ReleaseResultDisplayProps = ActionResultDisplayProps<ReleaseActionResult, ReleaseParameters>;

/** Release operation result display component */
const ReleaseResultDisplay = ({
    result, parameters, projects, getProjectJiraRef
}: ReleaseResultDisplayProps): JSX.Element => {
    const onCopyClick = useCallback(() => {
        navigator.clipboard.writeText(
            `Created tags:\n\n${result.createdTags
                .map(x => {
                    const projectLink = getProjectJiraRef(x.projectId);

                    return `- ${projectLink}: Tag "[${parameters.version}|${x.link}]"${x.markOnly ? " (Without MR)" : ""}`;
                })
                .join("\n")
            }`
        );
    }, [getProjectJiraRef, parameters.version, result.createdTags]);

    return (
        <section role="release-results">
            <Text
                disabled
                onValueChange={emptyFn}
                defaultValue={parameters.version}
                label={{ caption: "Version", horizontal: true }}
            />
            <CheckBox
                disabled
                isFormLabel
                fixBackgroundColor
                onValueChange={emptyFn}
                style={ElementColor.Link}
                defaultValue={parameters.setVersionTagAfter}
                label={{ caption: "Set version tag", horizontal: true }}
            />
            {parameters.setVersionTagAfter &&
                <Accordion
                    caption={`Created tags (${result.createdTags.length})`}
                    defaultExpanded
                >
                    {result.createdTags.length === 0 &&
                        <p className="is-italic has-text-grey pb-2">
                            Tag&apos;s were&apos;nt created! So sad! 😥
                        </p>
                    }
                    {result.createdTags.length > 0 &&
                        <>
                            <div className="top-right-btn-wrapper">
                                <div>
                                    <CopyToClipboardButton
                                        onClick={onCopyClick}
                                        title="Copy to clipboard for JIRA"
                                    />
                                </div>
                            </div>
                            <ul>
                                {result.createdTags.map(x =>
                                    <li
                                        key={x.link}
                                    >
                                        <span>
                                            <AnchorToProject
                                                projectId={x.projectId}
                                                project={projects.get(x.projectId)}
                                            />: Tag &quot;<Anchor
                                                href={x.link}
                                                caption={parameters.version}
                                                target="_blank"
                                                className="is-underlined"
                                            />&quot; {x.markOnly && <span className="is-italic has-text-grey">(Without MR)</span>}
                                        </span>
                                    </li>
                                )}
                            </ul>
                        </>
                    }
                </Accordion>
            }
            <hr />
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
