import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

import Icon from "@bodynarf/react.components/components/icon/component";

import "./style.scss";

import { NavigationMenuItem } from "@app/models";

/** Menu component props */
interface AppMenuProps {
    /** Menu items */
    menu: Array<NavigationMenuItem>;

    /** Is gitlab settings set (token & api address) */
    isApiConfigured: boolean;
}

/** App main menu component */
const AppMenu = ({
    menu, isApiConfigured,
}: AppMenuProps): JSX.Element => {
    const { pathname } = useLocation();
    const activeMenuItem = useMemo(() => menu.find(({ link }) => pathname.startsWith(link)), [menu, pathname]);

    return (
        <aside className="menu app-menu">
            <ul className="menu-list">
                {menu.map(x =>
                    <MenuItem
                        item={x}
                        key={x.name}
                        active={activeMenuItem?.name === x.name}
                        isApiConfigured={isApiConfigured}
                    />
                )}
            </ul>
        </aside>
    );
};

export default AppMenu;

/** Single menu item props */
interface MenuItemProps {
    /** Displaying item */
    item: NavigationMenuItem;

    /** Is menu item active */
    active: boolean;

    /** Is gitlab settings set (token & api address) */
    isApiConfigured: boolean;
}

const MenuItem = ({
    item, active, isApiConfigured,
}: MenuItemProps): JSX.Element => {
    if ((item.requireSettings ?? false) && !isApiConfigured) {
        return (
            <li
                key={item.name}
                className="is-italic"
            >
                <a
                    className="has-text-grey"
                    role="app-menu-link-disabled"
                    title="Item is disabled due to empty connection settings"
                >
                    <Icon name={item.icon} />
                    {item.caption}
                </a>
            </li>
        );
    }

    return (
        <li
            key={item.name}
        >
            <Link
                to={item.link}
                role="app-menu-link"
                className={active ? "is-active" : undefined}

            >
                <Icon name={item.icon} />
                {item.caption}
            </Link>
        </li>
    );
};
