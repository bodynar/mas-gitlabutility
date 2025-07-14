import { FC, useCallback } from "react";
import { connect } from "react-redux";

import { ElementSize } from "@bodynarf/react.components";
import Icon from "@bodynarf/react.components/components/icon";

import { getLocalizedText } from "@app/locale";
import { GlobalAppState } from "@app/store";
import { saveSettings } from "@app/store/app";

import "./styles.scss";

/** Props of `DarkThemeSwitcher` */
type DarkThemeSwitcherProps = {
    /** Is dark theme applied */
    isDarkTheme: boolean;

    /**
     * Save new dark theme value
     * @param isDark Is dark theme turned on
     */
    saveThemeFlagValue: (isDark: boolean) => void;
};

/** Switcher for theme selection */
const DarkThemeSwitcher: FC<DarkThemeSwitcherProps> = ({
    isDarkTheme = false,
    saveThemeFlagValue,
}: DarkThemeSwitcherProps) => {
    const switchThemeFlag = useCallback(
        (newValue: boolean) => {
            if (newValue === isDarkTheme) {
                return;
            }

            saveThemeFlagValue(newValue);
        },
        [isDarkTheme, saveThemeFlagValue]
    );
    const onThemeFlagChange = () => switchThemeFlag(!isDarkTheme);
    const onLightThemeClick = () => switchThemeFlag(false);
    const onDarkThemeClick = () => switchThemeFlag(true);

    const sunClassName: string = isDarkTheme ? "sun" : "sun-fill";
    const moonClassName: string = !isDarkTheme ? "moon" : "moon-stars-fill";

    return (
        <div className="app-mode-switcher">
            <Icon
                name={sunClassName}
                size={ElementSize.Small}
                onClick={onLightThemeClick}
                title={getLocalizedText("app.themeSwitcher.lightTheme")}
            />
            <span className="app-mode-switcher__switch">
                <input
                    type="checkbox"
                    checked={isDarkTheme}
                    readOnly
                />
                <span className="app-mode-switcher__slider" onClick={onThemeFlagChange}></span>
            </span>
            <Icon
                name={moonClassName}
                size={ElementSize.Small}
                onClick={onDarkThemeClick}
                title={getLocalizedText("app.themeSwitcher.darkTheme")}
            />
        </div>
    );
};

export default connect(
    ({ app }: GlobalAppState) => ({
        isDarkTheme: app.settings.isDarkTheme,
    }) as Partial<DarkThemeSwitcherProps>,
    {
        saveThemeFlagValue: (isDark: boolean) => saveSettings([[{
            key: "isDarkTheme",
            value: isDark
        }], false]),
    })(DarkThemeSwitcher);
