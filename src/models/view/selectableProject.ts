import { Project } from "../gitlab";

/** Project that could be selected */
export interface SelectableProject extends Project {
    /** Is selected at the moment */
    selected: boolean;
}
