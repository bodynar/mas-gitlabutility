import { isNullOrUndefined } from "@bodynarf/utils";

import { get } from "@app/core";
import { Group } from "@app/models";

const ITEMS_PER_PAGE = 100;

/**
 * Get all visible groups data
 * @returns Promise with all loaded groups
 */
export const getGroups = async (): Promise<Array<Group>> => {
    const loadedItems: Array<GetGroupResponse> = [];

    let counter = 0;

    while (counter++ < 100) {
        const pageItems = await get<Array<GetGroupResponse>>(`/groups?per_page=${ITEMS_PER_PAGE}&page=${counter}`);

        if (pageItems.length === 0) {
            break;
        }

        loadedItems.push(...pageItems);

        if (pageItems.length < ITEMS_PER_PAGE) {
            break;
        }
    }

    return loadedItems
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
        .withoutDuplicateBy(({ id }) => id)
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
