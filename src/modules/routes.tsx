import { NavigationMenuItem } from "@app/models";

import SettingsModule from "./settings";
import Notifications from "./notifications";
import Management from "./management";
import OperationsResults from "./results";
import OperationResult from "./results/components/itemPage";

export const siteMenu: Array<NavigationMenuItem> = [
    {
        caption: "Main",
        component: <Management />,
        link: "/main",
        name: "main",
        icon: "gitlab",
        display: true,
        requireSettings: true,
    },
    {
        caption: "Settings",
        component: <SettingsModule />,
        link: "/settings",
        name: "settings",
        icon: "gear-wide-connected",
        display: true,
    },
    {
        caption: "Notifications",
        component: <Notifications />,
        link: "/notifications",
        name: "notifications",
        icon: "bell",
        display: true,
    },
    {
        caption: "Results",
        component: <OperationsResults />,
        link: "/r",
        name: "operationsResults",
        icon: "journals",
        display: true,
    },
    {
        component: <OperationResult />,
        link: "/r/:id",
        name: "operationResult",
        display: false,
    },
];
