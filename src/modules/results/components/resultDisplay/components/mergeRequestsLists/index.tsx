import { FC, useCallback } from "react";

import { isNullOrEmpty, isNullOrUndefined } from "@bodynarf/utils";
import Anchor from "@bodynarf/react.components/components/anchor/component";
import Accordion from "@bodynarf/react.components/components/accordion";

import { MergeActionResult, MergeResult, NotMergedRequestInfo as NotMergedRequestInfoModel, Project } from "@app/models";

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
            `Merged MR's:\n\n${mergedRequests
                .map(x => {
                    const projectLink = getProjectJiraRef(x.projectId);

                    return `- ${projectLink}: Merge request "${x.ref}" merged in [${x.mergeCommitSha}|${x.link}]`;
                })
                .join("\n")
            }`
        );
    }, [getProjectJiraRef, mergedRequests]);

    const onCopyFailureClick = useCallback(() => {
        navigator.clipboard.writeText(
            `Not merged MR's:\n\n${notMergedRequests
                .map(x => {
                    const project = projects.get(x.projectId);
                    const projectLink = getProjectJiraRef(x.projectId);

                    if (!isNullOrUndefined(x.id)) {
                        if (isNullOrEmpty(x.ref)) {
                            return `${projectLink}: Merge request [!${x.id}|${project.link}/-/merge_requests/${x.id}] not merged: "${x.reason}"`;
                        }

                        return `${projectLink}: Merge request [${x.ref}|${x.link}] not merged: "${x.reason}"`;
                    }

                    return `${projectLink}: Merge request not created: "${x.reason}"`;
                })
                .join("\n")
            }`
        );
    }, [getProjectJiraRef, notMergedRequests, projects]);

    return (
        <section role="merge-results">
            <Accordion
                defaultExpanded={notMergedRequests.length > 0}
                caption={`Not merged MR's (${notMergedRequests.length})`}
            >
                {notMergedRequests.length === 0 &&
                    <p className="is-italic has-text-grey pb-2">
                        There&apos;s no not merged MR&apos;s! Hooray! 🎉
                    </p>
                }
                {notMergedRequests.length > 0 &&
                    <>
                        <div className="top-right-btn-wrapper">
                            <div>
                                <CopyToClipboardButton
                                    onClick={onCopyFailureClick}
                                    title="Copy to clipboard for JIRA"
                                />
                            </div>
                        </div>
                        <p className="is-italic has-text-grey pb-2">
                            These requests cannot be merged due to some errors. Please, merge it manually
                        </p>
                        <ul>
                            {notMergedRequests.map(x =>
                                <NotMergedRequestInfo
                                    key={x.id ?? x.projectId}

                                    notMergedRequest={x}
                                    projectId={x.projectId}
                                    project={projects.get(x.projectId)}
                                />
                            )}
                        </ul>
                    </>
                }
            </Accordion>
            <Accordion caption={`Merged MR's (${mergedRequests.length})`}>
                {mergedRequests.length === 0 &&
                    <p className="is-italic has-text-grey pb-2">
                        There&apos;s no merged MR&apos;s! So sad! 😥
                    </p>
                }
                {mergedRequests.length > 0 &&
                    <>
                        <div className="top-right-btn-wrapper">
                            <div>
                                <CopyToClipboardButton
                                    onClick={onCopySuccessClick}
                                    title="Copy to clipboard for JIRA"
                                />
                            </div>
                        </div>
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
                        />: Merge request <Anchor
                            target="_blank"
                            className="is-underlined"
                            href={`${project.link}/-/merge_requests/${notMergedRequest.id}`} // TODO: find better solution
                            caption={`!${notMergedRequest.id}`}
                        /> not merged: <span className="has-text-danger">
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
                    />: Merge request <Anchor
                        target="_blank"
                        className="is-underlined"
                        href={notMergedRequest.link}
                        caption={notMergedRequest.ref}
                    /> not merged: <span className="has-text-danger">
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
                />: Merge request not created: <span className="has-text-danger">
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
                />: Merge request {mergedRequest.ref} merged in <Anchor
                    target="_blank"
                    className="is-underlined"
                    href={mergedRequest.link}
                    caption={mergedRequest.mergeCommitSha}
                />
            </span>
        </li>
    );
};
