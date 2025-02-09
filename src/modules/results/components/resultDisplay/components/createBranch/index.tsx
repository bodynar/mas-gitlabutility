import { FC, useCallback } from "react";

import { emptyFn } from "@bodynarf/utils";
import Accordion from "@bodynarf/react.components/components/accordion";
import Text from "@bodynarf/react.components/components/primitives/text";

import { CreateBranchActionResult, CreateBranchParameters, Project } from "@app/models";

import { ActionResultDisplayProps } from "../../component";
import CopyToClipboardButton from "../copyToClipboardBtn";
import AnchorToProject from "../anchorToProject";

/** Props type of `CreateBranchResultDisplay` */
type CreateBranchResultDisplayProps = ActionResultDisplayProps<CreateBranchActionResult, CreateBranchParameters>;

/** CreateBranch operation result display component */
const CreateBranchResultDisplay: FC<CreateBranchResultDisplayProps> = ({
    result, parameters, projects, getProjectJiraRef,
}) => {
    const onCopyErrorsClick = useCallback(() => {
        navigator.clipboard.writeText(
            `Create new branch "${parameters.branchName}" from "${parameters.source}" errors:\n\n${result.errors
                .map(([projectId, error]) => {
                    const projectLink = getProjectJiraRef(projectId);

                    return `- ${projectLink}: Error "${error}"`;
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
                                {result.errors.map(([projectId, error]) =>
                                    <ResultListItem
                                        key={projectId}

                                        isError
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

export default CreateBranchResultDisplay;

/** Props of `ResultListItem` */
type ResultListItemProps = {
    /** Description message */
    text: string;

    /** Related project entity */
    project: Project;

    /** Related project identifier */
    projectId: number;

    /** Item text should be red colored */
    isError?: boolean;
};

/** Single list item of result list */
const ResultListItem: FC<ResultListItemProps> = ({
    project, projectId, text, isError = false,
}) => {
    return (
        <li>
            <span>
                <AnchorToProject
                    project={project}
                    projectId={projectId}
                />: <span
                    className={isError ? "has-text-danger" : undefined}
                >
                    {text}
                </span>
            </span>
        </li>
    );
};
