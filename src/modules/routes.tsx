import { NavigationMenuItem } from "@app/models";

import SettingsModule from "./settings";
import Notifications from "./notifications";
import Management from "./management";
import OperationsResults from "./results";
import OperationResult from "./results/components/itemPage";
import History from "./history";

export const siteMenu: Array<NavigationMenuItem> = [
    {
        caption: "app.menu.mainMenuItemCaption",
        component: <Management />,
        link: "/main",
        name: "main",
        icon: "gitlab",
        title: "app.menu.mainMenuItemTitle",
        display: true,
        requireSettings: true,
    },
    {
        caption: "app.menu.settingsMenuItemCaption",
        component: <SettingsModule />,
        link: "/settings",
        name: "settings",
        icon: "gear",
        activeIcon: "gear-fill",
        title: "app.menu.settingsMenuItemTitle",
        display: true,
    },
    {
        caption: "common.notifications",
        component: <Notifications />,
        link: "/notifications",
        name: "notifications",
        icon: "bell",
        activeIcon: "bell-fill",
        title: "app.menu.notificationsTitle",
        display: true,
    },
    {
        caption: "app.menu.resultsMenuItemCaption",
        component: <OperationsResults />,
        link: "/r",
        name: "operationsResults",
        icon: "journal",
        activeIcon: "journals",
        title: "app.menu.resultsMenuItemTitle",
        display: true,
    },
    {
        component: <OperationResult />,
        link: "/r/:id",
        name: "operationResult",
        display: false,
    },
    {
        caption: "app.menu.sessionHistoryMenuItemCaption",
        component: <History />,
        link: "/history",
        name: "history",
        icon: "book",
        activeIcon: "book-half",
        title: "app.menu.sessionHistoryMenuItemTitle",
        display: true,
    },
];
