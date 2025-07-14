import { FC, useCallback, useMemo } from "react";

import { emptyFn } from "@bodynarf/utils";
import { ElementColor } from "@bodynarf/react.components";
import Accordion from "@bodynarf/react.components/components/accordion";
import CheckBox from "@bodynarf/react.components/components/primitives/checkbox";
import Text from "@bodynarf/react.components/components/primitives/text";

import { CreateBranchActionError, CreateBranchActionResult, CreateBranchParameters } from "@app/models";
import { getLocalizedText } from "@app/locale";

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
            getLocalizedText("results.branch.create.captionTemplate").format(
                parameters.branchName,
                parameters.source
            )
            + ": "
            + getLocalizedText("results.errors")
            + "\n\n"
            + result.errors
                .map(({ projectId, message }) => {
                    const projectLink = getProjectJiraRef(projectId);

                    return `- ${projectLink}: ${getLocalizedText("common.error")} "${message}"`;
                })
                .join("\n")
        );
    }, [getProjectJiraRef, parameters.branchName, parameters.source, result.errors]);

    return (
        <section>
            <Text
                disabled
                onValueChange={emptyFn}
                defaultValue={parameters.source}
                label={{ caption: getLocalizedText("parameters.from"), horizontal: true }}
            />
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
                defaultValue={parameters.saveAsAdditionalBranch ?? false}
                label={{ caption: getLocalizedText("parameters.branch.create.saveBranchAsAdditionalBranch"), horizontal: true }}
            />
            <hr />
            <section>
                <Accordion
                    defaultExpanded
                    caption={`${getLocalizedText("results.branch.create.successCaption")} (${result.success.length})`}
                >
                    {result.success.length === 0
                        ? <span className="has-text-grey has-text-wrapped has-text-centered">
                            {getLocalizedText("results.branch.create.noSuccessCaption")}
                        </span>
                        : <ul>
                            {result.success.map(x =>
                                <ResultListItem
                                    key={x}
                                    projectId={x}
                                    project={projects.get(x)}
                                    text={getLocalizedText("results.branch.create.branchCreatedMessage")}
                                />
                            )}
                        </ul>

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

export default CreateBranchResultDisplay;
