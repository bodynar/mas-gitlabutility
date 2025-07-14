import { ReactNode } from "react";

import { LocaleKeys } from "@app/locale";

/** Base for menu items */
interface BaseMenuItem {
    /** Unique name */
    name: string;

    /** Locale key for caption */
    caption?: keyof LocaleKeys;
}

/** Navigation menu item */
export interface NavigationMenuItem extends BaseMenuItem {
    /** Target route link */
    link: string;

    /** Which component should be rendered as module */
    component: ReactNode;

    /** Icon name */
    icon?: string;

    /** Icon for active state */
    activeIcon?: string;

    /** Should navigation path item be displayed in left menu */
    display: boolean;

    /** Is menu item availability depends on settings state: are they filled? */
    requireSettings?: boolean;

    /** Locale key for title */
    title?: keyof LocaleKeys;
}
