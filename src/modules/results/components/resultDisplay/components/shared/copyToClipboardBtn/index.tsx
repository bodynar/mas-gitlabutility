import { FC, useCallback } from "react";

import { connect } from "react-redux";

import { ButtonProps, useDebounceHandler } from "@bodynarf/react.components";
import Button from "@bodynarf/react.components/components/button";

import { getLocalizedText, LocaleKeys } from "@app/locale";
import { displayInfo } from "@app/store/notificator";

import "./style.scss";

/** Props type of @see CopyToClipboardButton */
type CopyToClipboardButtonProps = Partial<ButtonProps> & {
    /**
     * Content of popup after button click
     * default value is located in resource by key `results.copyToClipboardButton.copiedToClipboard`
    */
    popupContent?: string;

    /** Click action handler */
    onClick: () => void;

    /**
     * Display info message
     * @param text Message to display locale key
     * @param doNotHide Should message stay on screen until manual user close action
     */
    showInformNotification: (message: keyof LocaleKeys, important?: boolean) => void;
};

/** Button with copy icon and popup tooltip after click */
const CopyToClipboardButton: FC<CopyToClipboardButtonProps> = (props) => {
    const clickHandler = useCallback(async (): Promise<void> => {
        props.onClick();

        props.showInformNotification("results.copyToClipboardButton.copiedToClipboard", false);
    }, [props]);

    const [debounce, onClick] = useDebounceHandler(clickHandler, 5);

    return (
        <div className="copy-btn-container">
            <div className="copy-btn-wrapper">
                <Button
                    {...props}
                    type="white"
                    onClick={onClick}
                    icon={{ name: "copy" }}
                    disabled={!debounce || (props.disabled ?? false)}
                    title={!debounce
                        ? getLocalizedText("results.copyToClipboardButton.buttonIsOnCoolDown")
                        : (props.title ?? getLocalizedText("results.copyToClipboardButton.copyToClipboard"))
                    }
                />
            </div>
        </div>
    );
};

export default connect(
    undefined,
    {
        showInformNotification: displayInfo
    }
)(CopyToClipboardButton);
