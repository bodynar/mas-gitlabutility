import { isNullish } from "@bodynarf/utils";
import { HttpError } from "@bodynarf/utils/api/simple";

import { Tag } from "@app/models";
import { deleteRequest, get, post } from "@app/core";

/**
 * Get project tags
 * @param projectId Project identifier
 * @param searchQuery Part of a name of the tag
 * @returns Promise with project tags
 */
export const findTags = async (projectId: number, searchQuery?: string): Promise<Array<Tag>> => {
    const items = await get<Array<TagApiResponse>>(
        `projects/${projectId}/repository/tags?` + new URLSearchParams({
            search: searchQuery
        }));

    return items.map(
        ({ name, target, commit }) => ({
            name,
            projectId,
            commitSha: target,
            commitLink: commit.web_url,
        }) as Tag);
};

/**
 * Get project tag information
 * @param projectId Project identifier
 * @param name Tag name
 * @returns Promise with tag info if tag is found; otherwise - `undefined`
 */
export const getTag = async (projectId: number, name: string): Promise<Tag | undefined> => {
    try {
        const tag = await get<TagApiResponse>(
            `projects/${projectId}/repository/tags/${name}`
        );

        return {
            name,
            projectId,
            commitSha: tag.target,
            commitLink: tag.commit.web_url,
        };
    } catch (error) {
		if (error instanceof HttpError) {
			if (error.response.status === 404) {
				return undefined;
			} else {
				const responseObject: { "message": string; } = await error.response.json();

				if (!isNullish(responseObject) && responseObject.message === "404 Tag Not Found") {
					return undefined;
				}
			}
		}

        throw error;
    }

};

/**
 * Add tag to specified commit
 * @param projectId Project identifier
 * @param name Tag name
 * @param commit Commit to attach a tag
 * @returns Promise with result
 */
export const addTag = async (
    projectId: number,
    name: string,
    commit: string
): Promise<Tag> => {
    const result = await post<TagApiResponse>(`/projects/${projectId}/repository/tags`, {
        tag_name: name,
        ref: commit
    });

    return {
        name: result.name,
        commitSha: result.target,
        projectId: projectId,
        commitLink: result.commit.web_url,
    };
};

/**
 * Delete specified branch from project
 * @param projectId Project identifier
 * @param name Name of the branch
 */
export const removeTag = async (
    projectId: number,
    name: string,
): Promise<void> => {
    await deleteRequest(`/projects/${projectId}/repository/tags/${name}`);
};

// #region Api response models

/** Common response for tag API */
interface TagApiResponse {
    name: string;
    target: string;
    message: string;
    commit: {
        id: string;
        created_at: string;
        author_name: string;
        committer_email: string;
        short_id: string;
        title: string;
        message: string;
        web_url: string;
    };
}

// #endregion
