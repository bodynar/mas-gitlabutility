import { BaseEntity } from ".";

/** Repository as project */
export interface Project extends BaseEntity {
    /** Optional group description */
    description: string;

    /** Date of creation */
    createdAt: Date;

    /** Avatar image link */
    imageSrc?: string;

    /** Is project in archive mode */
    archived: boolean;

    /** Created user id */
    createdBy: number;

    /** Amount of open issues */
    openIssuesCount: number;

    /** Parent group identifier */
    groupId: number;
}
