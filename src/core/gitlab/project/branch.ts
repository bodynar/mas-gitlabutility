import { isNullOrUndefined, post } from "@bodynarf/utils";

import { get } from "@app/core";
import { Branch, Commit } from "@app/models";

/**
 * Check is repository contains branch with specified name
 * @param projectId Project identifier
 * @param name Branch name
 * @returns Promise with boolean result
 */
export const checkHasBranch = async (projectId: number, name: string): Promise<boolean> => {
    const branches = await get<Array<BranchResponse>>(
        `/projects/${projectId}/repository/branches?` + new URLSearchParams({
            search: name,
        })
    );

    return !isNullOrUndefined(branches) && branches.length > 0;
};

/**
 * Create branch in project
 * @param projectId Project identifier
 * @param commitSha Commit SHA to start branch from
 * @param name Name of branch
 * @returns Promise with created branch info
 */
export const createBranch = async (projectId: number, commitSha: string, name: string): Promise<Branch> => {
    const apiResult = await post<BranchResponse>(`/projects/${projectId}/repository/branches`, {
        id: projectId,
        branch: name,
        ref: commitSha,
    });

    return {
        commitLink: apiResult.commit.web_url,
        link: apiResult.web_url,
        commitSha,
        name,
        projectId,
    };
};

/**
 * Check branches for differences
 * @param projectId Project identifier
 * @param source Source branch name, which should give changes
 * @param target Target branch name, which should took changes
 * @returns Promise with flag: is there any difference between branches
 */
export const checkHasDiffs = async (
    projectId: number,
    source: string,
    target: string,
): Promise<boolean> => {
    const { diffs } = await get<CompareBranchesResponse>(
        `/projects/${projectId}/repository/compare?` + new URLSearchParams({
            from: target,
            to: source,
        }));

    return diffs.length > 0;
};

/**
 * Get commit info by its SHA
 * @param projectId Project identifier
 * @param commitSha Commit SHA
 * @returns Promise with commit info
 */
export const getCommitInfo = async (
    projectId: number,
    commitSha: string,
): Promise<Commit> => {
    const apiResult = await get<GetCommitInfoResponse>(`/projects/${projectId}/repository/commits/${commitSha}`);

    return {
        link: apiResult.web_url,
        sha: commitSha,
        projectId,
    };
};

/**
 * Get branch data
 * @param projectId Project identifier
 * @param branchName Name of the branch
 * @returns Promise with branch data
 */
export const getBranchInfo = async (
    projectId: number,
    branchName: string,
): Promise<Branch> => {
    const apiResult = await get<BranchResponse>(`/projects/${projectId}/repository/branches/${branchName}`);

    return {
        commitLink: apiResult.commit.web_url,
        commitSha: apiResult.commit.id,
        link: apiResult.web_url,
        name: branchName,
        projectId,
    };
};

// #region Api response models

/** Compare request result */
interface CompareBranchesResponse {
    /** File differences */
    diffs: Array<unknown>;
}

/** Commit info gathering result */
interface GetCommitInfoResponse {
    /** Url to commit */
    web_url: string;
}

/**
 * Response of `createBranch` & `checkHasBranch`
 * @see Branch
 */
interface BranchResponse {
    /** Branch name */
    name: string;

    /** Link to branch */
    web_url: string;

    /** Commit info */
    commit: {
        /** Sha */
        id: string;

        /** Link to start commit */
        web_url: string;
    };
}

// #endregion
