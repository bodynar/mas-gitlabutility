import { FC, useCallback, useMemo } from "react";

import { emptyFn } from "@bodynarf/utils";
import Accordion from "@bodynarf/react.components/components/accordion";
import Text from "@bodynarf/react.components/components/primitives/text";

import { CreateBranchActionError, CreateBranchActionResult, CreateBranchParameters } from "@app/models";

import { ActionResultDisplayProps } from "../../../component";
import CopyToClipboardButton from "../../shared/copyToClipboardBtn";
import { ResultListItem } from "../../shared/resultListItem";

/** Props type of `CreateBranchResultDisplay` */
type CreateBranchResultDisplayProps = ActionResultDisplayProps<CreateBranchActionResult, CreateBranchParameters>;

/** CreateBranch operation result display component */
const CreateBranchResultDisplay: FC<CreateBranchResultDisplayProps> = ({
    result, parameters, projects, getProjectJiraRef,
}) => {
    const errors = useMemo(() => result.errors.groupBy<CreateBranchActionError>("type"), [result.errors]);

    const onCopyErrorsClick = useCallback(() => {
        navigator.clipboard.writeText(
            `Create new branch "${parameters.branchName}" from "${parameters.source}" errors:\n\n${result.errors
                .map(({ projectId, message }) => {
                    const projectLink = getProjectJiraRef(projectId);

                    return `- ${projectLink}: Error "${message}"`;
                })
                .join("\n")
            }`
        );
    }, [getProjectJiraRef, parameters.branchName, parameters.source, result.errors]);

    return (
        <section>
            <Text
                disabled
                onValueChange={emptyFn}
                defaultValue={parameters.source}
                label={{ caption: "Source branch", horizontal: true }}
            />
            <Text
                disabled
                onValueChange={emptyFn}
                defaultValue={parameters.branchName}
                label={{ caption: "Branch name", horizontal: true }}
            />
            <hr />
            <section>
                <Accordion
                    caption={`Created branches (${result.success.length})`}
                    defaultExpanded
                >
                    {result.success.length === 0
                        ? <span className="has-text-grey has-text-wrapped has-text-centered">
                            No branches were created! 😥
                        </span>
                        : <ul>
                            {result.success.map(x =>
                                <ResultListItem
                                    key={x}
                                    projectId={x}
                                    text="Branch created"
                                    project={projects.get(x)}
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

export default CreateBranchResultDisplay;
