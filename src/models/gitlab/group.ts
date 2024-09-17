import { BaseEntity, Project } from ".";

/** Group (pack of projects) */
export interface Group extends BaseEntity {
    /** Repositories in group */
    projects: Array<Project>;

    /** Is child projects loaded */
    childrenLoaded: boolean;

    /** Optional group description */
    description: string;

    /** Date of creation */
    createdAt: Date;

    /** Parent group identifier */
    parentId?: number;

    /** Avatar image link */
    imageSrc?: string;
}
