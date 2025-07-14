import { FC, useCallback, useMemo } from "react";

import { isNullOrEmpty, isNullOrUndefined } from "@bodynarf/utils";
import Anchor from "@bodynarf/react.components/components/anchor/component";
import Accordion from "@bodynarf/react.components/components/accordion";

import { MergeActionResult, MergeResult, NotMergedRequestInfo as NotMergedRequestInfoModel, Project } from "@app/models";
import { getLocalizedText } from "@app/locale";

import CopyToClipboardButton from "../copyToClipboardBtn";
import AnchorToProject from "../anchorToProject";

/** Props type of `MergeRequestsList` */
type MergeRequestsListProps = Pick<MergeActionResult, "mergedRequests" | "notMergedRequests"> & {
    /** Available projects */
    projects: Map<number, Project>;

    /**
     * Get link to project in JIRA link notation
     * @param projectId Project identifier
     * @returns Link to project for JIRA
     */
    getProjectJiraRef: (projectId: number) => string;
};

/** Merge operation result display component */
const MergeRequestsList: FC<MergeRequestsListProps> = ({
    projects, notMergedRequests, mergedRequests, getProjectJiraRef,
}) => {
    const onCopySuccessClick = useCallback(() => {
        navigator.clipboard.writeText(
            getLocalizedText("results.mergeRequest.mergedRequests")
            + ":\n\n"
            + mergedRequests
                .map(x => {
                    const projectLink = getProjectJiraRef(x.projectId);

                    return getLocalizedText("results.mergeRequest.list.copySuccessCaptionItemTemplate")
                        .format(
                            projectLink,
                            x.ref,
                            x.mergeCommitSha,
                            x.link
                        );
                })
                .join("\n")
        );
    }, [getProjectJiraRef, mergedRequests]);

    const onCopyFailureClick = useCallback(() => {
        navigator.clipboard.writeText(
            getLocalizedText("results.mergeRequest.list.notSuccessCaption")
            + ":\n\n"
            + notMergedRequests
                .map(x => {
                    const project = projects.get(x.projectId);
                    const projectLink = getProjectJiraRef(x.projectId);

                    if (!isNullOrUndefined(x.id)) {
                        const link = isNullOrEmpty(x.ref)
                            ? `${project.link}/-/merge_requests/${x.id}`
                            : x.link;

                        return getLocalizedText("results.mergeRequest.list.copyNotSuccessCaptionItemTemplate")
                            .format(
                                projectLink,
                                x.ref,
                                link,
                                x.reason
                            );
                    }

                    return getLocalizedText("results.mergeRequest.list.copyNotCreatedMergeRequestItemTemplate")
                        .format(
                            projectLink,
                            x.reason
                        );
                })
                .join("\n")
        );
    }, [getProjectJiraRef, notMergedRequests, projects]);

    const errors = useMemo(() => notMergedRequests.groupBy<NotMergedRequestInfoModel>("reasonType"), [notMergedRequests]);

    return (
        <section role="merge-results">
            <Accordion
                defaultExpanded={notMergedRequests.length > 0}
                caption={`${getLocalizedText("results.mergeRequest.list.notSuccessCaption")} (${notMergedRequests.length})`}
            >
                {notMergedRequests.length === 0 &&
                    <p className="is-italic has-text-grey pb-2">
                        {getLocalizedText("results.mergeRequest.list.notSuccessEmpty")}
                    </p>
                }
                {notMergedRequests.length > 0 &&
                    <>
                        <div>
                            <p className="is-italic has-text-grey pb-2">
                                {getLocalizedText("results.mergeRequest.list.notSuccessError")}
                            </p>
                            <ul>
                                {errors.map(({ items }, index) =>
                                    <>
                                        {items.map(x =>
                                            <NotMergedRequestInfo
                                                key={x.id ?? x.projectId}

                                                notMergedRequest={x}
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
                            onClick={onCopyFailureClick}
                            title={getLocalizedText("results.copyToClipboard")}
                        />
                    </>
                }
            </Accordion>
            <Accordion
                caption={`${getLocalizedText("results.mergeRequest.mergedRequests")} (${mergedRequests.length})`}
            >
                {mergedRequests.length === 0 &&
                    <p className="is-italic has-text-grey pb-2">
                        {getLocalizedText("results.mergeRequest.noMergedRequests")}
                    </p>
                }
                {mergedRequests.length > 0 &&
                    <>
                        <ul>
                            {mergedRequests.map(x =>
                                <MergedRequestInfo
                                    key={x.id}
                                    mergedRequest={x}
                                    projectId={x.projectId}
                                    project={projects.get(x.projectId)}
                                />
                            )}
                        </ul>
                        <CopyToClipboardButton
                            onClick={onCopySuccessClick}
                            title={getLocalizedText("results.copyToClipboard")}
                        />
                    </>
                }
            </Accordion>
        </section >
    );
};

export default MergeRequestsList;

/** Props type of `NotMergedRequestInfo` */
type NotMergedRequestInfoProps = {
    /** Related project entity */
    project: Project;

    /** Related project identifier */
    projectId: number;

    /** Merge request, which wasn't merged due some reasons */
    notMergedRequest: NotMergedRequestInfoModel;
};

/** Information about single not merged MR */
const NotMergedRequestInfo: FC<NotMergedRequestInfoProps> = ({
    project, projectId, notMergedRequest
}) => {
    if (!isNullOrUndefined(notMergedRequest.id)) {
        if (isNullOrEmpty(notMergedRequest.ref)) {
            return (
                <li>
                    <span>
                        <AnchorToProject
                            project={project}
                            projectId={projectId}
                        />: {getLocalizedText("results.mergeRequest.list.mergeRequest")} <Anchor
                            target="_blank"
                            className="is-underlined"
                            href={`${project.link}/-/merge_requests/${notMergedRequest.id}`} // TODO: find better solution
                            caption={`!${notMergedRequest.id}`}
                        /> {getLocalizedText("results.mergeRequest.list.notMerged")}: <span className="has-text-danger">
                            {notMergedRequest.reason}
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
                    />: {getLocalizedText("results.mergeRequest.list.mergeRequest")} <Anchor
                        target="_blank"
                        className="is-underlined"
                        href={notMergedRequest.link}
                        caption={notMergedRequest.ref}
                    /> {getLocalizedText("results.mergeRequest.list.notMerged")}: <span className="has-text-danger">
                        {notMergedRequest.reason}
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
                />: {getLocalizedText("results.mergeRequest.list.mergeRequestNotCreated")}: <span className="has-text-danger">
                    {notMergedRequest.reason}
                </span>
            </span>
        </li>
    );
};

/** Props type of `MergeRequestInfo` */
type MergedRequestInfoProps = {
    /** Related project entity */
    project: Project;

    /** Related project identifier */
    projectId: number;

    /** Successfully merged request data */
    mergedRequest: MergeResult;
};

/** Information about single merged MR */
const MergedRequestInfo: FC<MergedRequestInfoProps> = ({
    project, projectId, mergedRequest,
}) => {
    return (
        <li>
            <span>
                <AnchorToProject
                    project={project}
                    projectId={projectId}
                />: {getLocalizedText("results.mergeRequest.list.mergeRequestMergedTemplate").format(mergedRequest.ref)} <Anchor
                    target="_blank"
                    className="is-underlined"
                    href={mergedRequest.link}
                    caption={mergedRequest.mergeCommitSha}
                />
            </span>
        </li>
    );
};
