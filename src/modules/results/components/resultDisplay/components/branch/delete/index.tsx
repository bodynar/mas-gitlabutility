import { FC, useCallback, useMemo } from "react";

import { emptyFn } from "@bodynarf/utils";
import Accordion from "@bodynarf/react.components/components/accordion";
import Text from "@bodynarf/react.components/components/primitives/text";

import { DeleteBranchActionResult, DeleteBranchError, DeleteBranchParameters } from "@app/models";

import { ActionResultDisplayProps } from "../../../component";
import CopyToClipboardButton from "../../shared/copyToClipboardBtn";
import { ResultListItem } from "../../shared/resultListItem";

/** Props type of `DeleteBranchResultDisplay` */
type DeleteBranchResultDisplayProps = ActionResultDisplayProps<DeleteBranchActionResult, DeleteBranchParameters>;

/** DeleteBranch operation result display component */
const DeleteBranchResultDisplay: FC<DeleteBranchResultDisplayProps> = ({
    result, parameters, projects, getProjectJiraRef,
}) => {
    const errors = useMemo(() => result.errors.groupBy<DeleteBranchError>("type"), [result.errors]);

    const onCopyErrorsClick = useCallback(() => {
        navigator.clipboard.writeText(
            `Delete branch "${parameters.branchName}" errors:\n\n${result.errors
                .map(({ projectId, message }) => {
                    const projectLink = getProjectJiraRef(projectId);

                    return `- ${projectLink}: Error "${message}"`;
                })
                .join("\n")
            }`
        );
    }, [getProjectJiraRef, parameters.branchName, result.errors]);

    return (
        <section>
            <Text
                disabled
                onValueChange={emptyFn}
                defaultValue={parameters.branchName}
                label={{ caption: "Branch name", horizontal: true }}
            />
            <hr />
            <section>
                <Accordion
                    caption={`Deleted branches (${result.deleted.length})`}
                    defaultExpanded
                >
                    {result.deleted.length === 0
                        ? <span className="has-text-grey has-text-wrapped has-text-centered">
                            No branches were deleted! 😥
                        </span>
                        : <ul>
                            {result.deleted.map(x =>
                                <ResultListItem
                                    key={x}
                                    projectId={x}
                                    text="Branch deleted"
                                    project={projects.get(x)}
                                />
                            )}
                        </ul>

                    }
                </Accordion>

                <Accordion
                    defaultExpanded={result.ambiguityItems.length > 0}
                    caption={`Ambiguity branches (${result.ambiguityItems.length})`}
                >
                    {result.ambiguityItems.length === 0
                        ? <span className="has-text-grey has-text-wrapped has-text-centered">
                            No ambiguity! Hooray! 🎉
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
                                {result.ambiguityItems.map(({ projectId, branchesCount }) =>
                                    <ResultListItem
                                        key={projectId}

                                        isError
                                        text={`Branches with "${parameters.branchName}" in name: ${branchesCount}`}
                                        projectId={projectId}
                                        project={projects.get(projectId)}
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
                        </>
                    }
                </Accordion>
            </section>
        </section>
    );
};

export default DeleteBranchResultDisplay;
