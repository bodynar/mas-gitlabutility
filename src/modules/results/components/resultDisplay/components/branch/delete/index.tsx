import { FC, useCallback, useMemo } from "react";

import { emptyFn } from "@bodynarf/utils";
import { ElementColor } from "@bodynarf/react.components";
import Accordion from "@bodynarf/react.components/components/accordion";
import CheckBox from "@bodynarf/react.components/components/primitives/checkbox";
import Text from "@bodynarf/react.components/components/primitives/text";

import { DeleteBranchActionResult, DeleteBranchError, DeleteBranchParameters } from "@app/models";
import { getLocalizedText } from "@app/locale";

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
            getLocalizedText("shared.actionDescriptions.deleteBranch")
            + ` "${parameters.branchName}": `
            + getLocalizedText("results.errors")
            + "\n\n"
            + result.errors
                .map(({ projectId, message }) => {
                    const projectLink = getProjectJiraRef(projectId);

                    return `- ${projectLink}: ${getLocalizedText("common.error")} "${message}"`;
                })
                .join("\n")
        );
    }, [getProjectJiraRef, parameters.branchName, result.errors]);

    return (
        <section>
            <Text
                disabled
                onValueChange={emptyFn}
                defaultValue={parameters.branchName}
                label={{ caption: getLocalizedText("parameters.branch.branchName"), horizontal: true }}
            />
            <CheckBox
                disabled
                isFormLabel
                fixBackgroundColor
                onValueChange={emptyFn}
                style={ElementColor.Link}
                defaultValue={parameters.deleteBranchFromAdditionalBranches ?? false}
                label={{ caption: getLocalizedText("parameters.branch.delete.deleteBranchFromAdditionalBranches"), horizontal: true }}
            />
            <hr />
            <section>
                <Accordion
                    defaultExpanded
                    caption={`${getLocalizedText("results.branch.delete.successCaption")} (${result.deleted.length})`}
                >
                    {result.deleted.length === 0
                        ? <span className="has-text-grey has-text-wrapped has-text-centered">
                            {getLocalizedText("results.branch.delete.noSuccessCaption")}
                        </span>
                        : <ul>
                            {result.deleted.map(x =>
                                <ResultListItem
                                    key={x}
                                    projectId={x}
                                    project={projects.get(x)}
                                    text={getLocalizedText("results.branch.delete.branchDeletedMessage")}
                                />
                            )}
                        </ul>

                    }
                </Accordion>

                <Accordion
                    defaultExpanded={result.ambiguityItems.length > 0}
                    caption={`${getLocalizedText("results.branch.delete.ambiguityCaption")} (${result.ambiguityItems.length})`}
                >
                    {result.ambiguityItems.length === 0
                        ? <span className="has-text-grey has-text-wrapped has-text-centered">
                            {getLocalizedText("results.branch.delete.noAmbiguityCaption")}
                        </span>
                        : <>
                            <ul>
                                {result.ambiguityItems.map(({ projectId, branchesCount }) =>
                                    <ResultListItem
                                        key={projectId}

                                        isError
                                        projectId={projectId}
                                        project={projects.get(projectId)}
                                        text={getLocalizedText("results.branch.delete.ambiguityItemTemplate").format(parameters.branchName, `${branchesCount}`)}
                                    />
                                )}
                            </ul>
                            <CopyToClipboardButton
                                onClick={onCopyErrorsClick}
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
                                onClick={onCopyErrorsClick}
                                title={getLocalizedText("results.copyToClipboard")}
                            />
                        </>
                    }
                </Accordion>
            </section>
        </section>
    );
};

export default DeleteBranchResultDisplay;
