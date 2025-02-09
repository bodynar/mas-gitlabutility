import { FC, useEffect, useMemo, useState } from "react";

import { name, version } from "package.json";
import { isNullish } from "@bodynarf/utils";
import { appSession } from "@app/shared/values";

/** Title on app name when user is blessed by random */
const glitchyTitle = "Seems app is glitchy..";

/** App brand container component */
const Brand = (): JSX.Element => {
    const isLucky = useMemo(() => Math.floor(Math.random() * 100) >= 90, []);

    const [strangeThingsCouldHappen, setStrangeThingsCouldHappen] = useState(false);

    useEffect(() => {
        if (isLucky) {
            const timeout = setTimeout(() => setStrangeThingsCouldHappen(true), 35 * 1000);

            return () => clearTimeout(timeout);
        }
    }, [isLucky]);

    if (isLucky) {
        import("./style.scss");

        return (
            <section
                className="mb-4"
                role={strangeThingsCouldHappen ? "chance" : undefined}
            >
                <h2
                    className="title is-2 is-capitalized is-inline"
                    title={strangeThingsCouldHappen ? glitchyTitle : undefined}
                >
                    <span>
                        {name}
                    </span>
                </h2>
                <span className="has-text-grey ml-2">
                    v{version}
                </span>
                <AppSessionLabel />
            </section>
        );
    }

    return (
        <section className="mb-4">
            <h2 className="title is-2 is-capitalized is-inline">
                {name}
            </h2>
            <span className="has-text-grey ml-2">
                v{version}
            </span>
            <AppSessionLabel />
        </section>
    );
};

export default Brand;

/** Label with app session id component */
const AppSessionLabel: FC = () => {
    if (isNullish(appSession)) {
        return <></>;
    }

    return (
        <>
            <br />
            <span className="has-text-grey mt-1 is-size-6 is-italic">
                Session: <span
                    className="is-family-monospace"
                    style={{ cursor: "help" }}
                    title={appSession.id}
                >
                    {appSession.id.substring(0, 8)}
                </span>
            </span>
        </>
    );
};
