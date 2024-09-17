/** Base for menu items */
interface BaseMenuItem {
    /** Unique name */
    name: string;

    /** Caption */
    caption?: string;
}

/** Navigation menu item */
export interface NavigationMenuItem extends BaseMenuItem {
    /** Target route link */
    link: string;

    /** Which component should be rendered as module */
    component: JSX.Element;

    /** Icon name */
    icon?: string;

    /** Should navigation path item be displayed in left menu */
    display: boolean;

    /** Is menu item availability depends on settings state: are they filled? */
    requireSettings?: boolean;
}
