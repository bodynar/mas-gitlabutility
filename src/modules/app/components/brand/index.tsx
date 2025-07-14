import { FC, useEffect, useMemo, useState } from "react";

import { isNullish } from "@bodynarf/utils";

import { name, version } from "package.json";

import { getLocalizedText } from "@app/locale";
import { appSession } from "@app/shared/values";

/** App brand container component */
const Brand: FC = () => {
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
                    title={strangeThingsCouldHappen ? getLocalizedText("app.brand.glitchyTitle") : undefined}
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
                {getLocalizedText("common.session")}: <span
                    title={appSession.id}
                    style={{ cursor: "help" }}
                    className="is-family-monospace"
                >
                    {appSession.id.substring(0, 8)}
                </span>
            </span>
        </>
    );
};
