/** Base model */
export interface BaseEntity {
    /** Unique entity id */
    id: number;

    /** Entity name */
    name: string;

    /** Link to web page of entity */
    link: string;

    /** Full name  */
    fullName: string;
}
