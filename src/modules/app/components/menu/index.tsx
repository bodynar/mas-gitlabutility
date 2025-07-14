import { FC, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

import { isNullish } from "@bodynarf/utils";
import Icon from "@bodynarf/react.components/components/icon/component";

import "./style.scss";

import { NavigationMenuItem } from "@app/models";
import { getLocalizedText } from "@app/locale";

/** Menu component props */
type AppMenuProps = {
    /** Menu items */
    menu: Array<NavigationMenuItem>;

    /** Is gitlab settings set (token & api address) */
    isApiConfigured: boolean;
};

/** App main menu component */
const AppMenu: FC<AppMenuProps> = ({
    menu, isApiConfigured,
}) => {
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
type MenuItemProps = {
    /** Displaying item */
    item: NavigationMenuItem;

    /** Is menu item active */
    active: boolean;

    /** Is gitlab settings set (token & api address) */
    isApiConfigured: boolean;
};

const MenuItem: FC<MenuItemProps> = ({
    item, active, isApiConfigured,
}) => {
    if ((item.requireSettings ?? false) && !isApiConfigured) {
        return (
            <li
                key={item.name}
                className="is-italic"
            >
                <a
                    className="has-text-grey"
                    role="app-menu-link-disabled"
                    title={getLocalizedText("app.menu.disabledItemTitle")}
                >
                    <Icon name={item.icon} />
                    {getLocalizedText(item.caption)}
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
                title={isNullish(item.title) ? null : getLocalizedText(item.title)}
            >
                <Icon name={active ? (item.activeIcon ?? item.icon) : item.icon} />
                {getLocalizedText(item.caption)}
            </Link>
        </li>
    );
};
