/** Git branch tag */
export interface Tag {
    /** Name */
    name: string;

    /** Bound commit sha */
    commitSha: string;

    /** Parent project identifier */
    projectId: number;

    /** Link to commit */
    commitLink: string;
}
