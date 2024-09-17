import { get, post, put } from "@app/core";
import { CreateMergeRequestResult, DEFAULT_BRANCHES, DefaultBranch, MergeRequest, MergeRequestState, MergeResult } from "@app/models";

// #region constants

/** Default label for merge request */
const DEFAULT_LABEL = "merge::auto";

/** Merge request label for upstream merge */
const UPSTREAM_LABEL = "merge::upstream";

/** Merge request label for downstream merge */
const DOWNSTREAM_LABEL = "merge::downstream";

// #endregion

/**
 * Create merge request
 * @param projectId Project identifier
 * @param source Source branch name, which should give changes
 * @param target Target branch name, which should took changes
 * @param name Merge request name
 * @returns Promise with operation result, described in `CreateMergeRequestResult`
 */
export const createMergeRequest = async (
    projectId: number,
    source: DefaultBranch,
    target: DefaultBranch,
    name: string,
): Promise<CreateMergeRequestResult> => { // TODO: use MergeRequest in return model
    const labels = getLabels(source, target);

    const apiResult = await post<CreateMergeRequestResponse>(
        `/projects/${projectId}/merge_requests`,
        {
            source_branch: source,
            target_branch: target,
            title: name,
            labels: labels,
        });

    return {
        id: apiResult.iid,
        projectId: projectId,
        hasConflicts: apiResult.has_conflicts,
        link: apiResult.web_url,
        source: source,
        target: target,
        ref: apiResult.references.short,
    };
};

/**
 * Merge merge request
 * @param projectId Project identifier
 * @param id Merge request unique identifier (internally in project scope) 
 * @returns Promise with operation result, described in `MergeResult`
 */
export const merge = async (projectId: number, id: number): Promise<MergeResult> => {
    const apiResult = await put<MergeResponse>(
        `/projects/${projectId}/merge_requests/${id}/merge`,
        {
            id: projectId,
            merge_request_iid: id,
        }
    );

    return {
        id: id,
        projectId: projectId,
        hasConflicts: apiResult.has_conflicts,
        link: apiResult.web_url,
        mergeCommitSha: apiResult.merge_commit_sha,
        error: apiResult.merge_error,
        ref: apiResult.references.short,
    };
};

/**
 * Get merge request info
 * @param projectId Project identifier
 * @param id Merge request identifier
 * @returns Promise with instance of `MergeRequest`
 */
export const getInfo = async (projectId: number, id: number): Promise<MergeRequest> => {
    const apiResult = await get<GetInfoResponse>(`/projects/${projectId}/merge_requests/${id}`);

    return {
        id: apiResult.iid,
        projectId: apiResult.project_id,
        globalId: apiResult.iid,
        title: apiResult.title,
        sourceBranch: apiResult.source_branch,
        targetBranch: apiResult.target_branch,
        labels: apiResult.labels,
        draft: apiResult.work_in_progress,
        hasConflicts: apiResult.has_conflicts,
        link: apiResult.web_url,
        state: apiResult.state as MergeRequestState,
        status: apiResult.merge_status,
        fromCommitSha: apiResult.sha,
        canBeMergedByCurrentUser: apiResult.user.can_merge,
        mergeError: apiResult.merge_error,
        ref: apiResult.references.short,
    };
};

/**
 * Get labels for merge request
 * @example getLabels(DefaultBranch.Test, DefaultBranch.Master) will provide an `merge::auto,merge::upstream` result
 * @param sourceBranch Name of source branch (which will be merged)
 * @param targetBranch Name of target branch (which will be merged into)
 * @returns Merge request labels, separated by comma
 */
const getLabels = (sourceBranch: DefaultBranch, targetBranch: DefaultBranch): string => {
    const labels = [
        DEFAULT_LABEL,
    ];

    const sourceBranchIndex = DEFAULT_BRANCHES.indexOf(sourceBranch);
    const targetBranchIndex = DEFAULT_BRANCHES.indexOf(targetBranch);

    labels.push(
        sourceBranchIndex > targetBranchIndex
            ? DOWNSTREAM_LABEL
            : UPSTREAM_LABEL
    );


    return labels.join(",");
};

// #region response models

/** 
 * Api call `createMergeRequest` response
 * @see CreateMergeRequestResult
 */
interface CreateMergeRequestResponse {
    id: number;
    iid: number;
    has_conflicts: boolean;
    merge_error?: string;
    target_branch: string;
    source_branch: string;
    web_url: string;
    references: { short: string };
}

/**
 * Api call `merge` response
 * @see MergeResult
 */
interface MergeResponse {
    merge_commit_sha: string;
    has_conflicts: boolean;
    merge_error?: string;
    web_url: string;
    references: { short: string };
}

/** @see MergeRequest */
interface GetInfoResponse {
    id: number;
    iid: number;
    project_id: number;
    title: string;
    state: string;
    target_branch: string;
    source_branch: string;
    labels: Array<string>;
    work_in_progress: boolean;
    merge_status: string;
    sha: string;
    web_url: string;
    has_conflicts: boolean;
    merge_error?: string;
    user: { can_merge: boolean; };
    references: { short: string };
}

// #endregion
