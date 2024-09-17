import { isNullOrUndefined } from "@bodynarf/utils";

import { get } from "@app/core";
import { Group } from "@app/models";

/**
 * Get all visible groups data
 * @returns Promise with all loaded groups
 */
export const getGroups = async (): Promise<Array<Group>> => {
    const groupDataItems = await get<Array<GetGroupResponse>>(`/groups?per_page=100`);

    return groupDataItems
        .map(x => ({
            id: x.id,
            link: x.web_url,
            name: x.name,
            description: x.description,
            fullName: x.full_name,
            createdAt: new Date(x.created_at),
            parentId: x.parent_id,
            imageSrc: x.avatar_url,
            projects: [],
            childrenLoaded: false,
        }) as Group)
        .filter(x => !isNullOrUndefined(x.parentId))
        .sort((l, r) => l.fullName.localeCompare(r.fullName));
};

/** @see Group */
interface GetGroupResponse {
    id: number;
    web_url: string;
    name: string;
    description: string;
    full_name: string;
    created_at: string;
    parent_id?: number;
    avatar_url?: string;
}
