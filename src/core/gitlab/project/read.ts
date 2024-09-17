import { get } from "@app/core";
import { Project } from "@app/models";

/**
 * Get all projects in specific group
 * @param groupId Group identifier value
 * @returns Promise with all projects in specific group
 */
export const getProjects = async (groupId: number): Promise<Array<Project>> => {
    const groupDataItems = await get<Array<GetProjectsResponse>>(`/groups/${groupId}/projects?archived=false&per_page=100`); // TODO: load while page is empty

    return groupDataItems
        .map(x => ({
            id: x.id,
            link: x.web_url,
            name: x.name,
            description: x.description,
            fullName: x.name_with_namespace,
            createdAt: new Date(x.created_at),
            imageSrc: x.avatar_url,

            archived: x.archived,
            createdBy: +x.creator_id,
            openIssuesCount: +x.open_issues_count,
            groupId,
        }) as Project)
        .sort((l, r) => l.fullName.localeCompare(r.fullName))
        ;
};

/** @see Project */
interface GetProjectsResponse {
    id: number;
    web_url: string;
    name: string;
    description: string;
    name_with_namespace: string;
    created_at: string;
    avatar_url: string;
    archived: boolean;
    creator_id: number;
    open_issues_count: number;
}
