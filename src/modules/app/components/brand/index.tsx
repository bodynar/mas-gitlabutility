import { useEffect, useMemo, useState } from "react";

import { name, version } from "package.json";

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
        </section>
    );
};

export default Brand;
