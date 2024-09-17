/** Repository branch model */
export interface Branch {
    /** Branch name */
    name: string;

    /**
     * Latest commit SHA
     */
    commitSha: string;

    /** Link to start commit */
    commitLink: string;

    /** Project identifier */
    projectId: number;

    /** Link to branch */
    link: string;
}
