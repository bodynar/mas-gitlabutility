import { FC, useCallback, useEffect, useState } from "react";

import { emptyFn, isNullOrUndefined } from "@bodynarf/utils";
import { ButtonProps } from "@bodynarf/react.components";
import Button from "@bodynarf/react.components/components/button";

import "./style.scss";

/** Props type of @see CopyToClipboardButton */
type CopyToClipboardButtonProps = Partial<ButtonProps> & {
    /**
     * Content of popup after button click
     * @default "Copied to clipboard"
    */
    popupContent?: string;

    /** Click action handler */
    onClick: () => void;
};

/** Button with copy icon and popup tooltip after click */
const CopyToClipboardButton: FC<CopyToClipboardButtonProps> = (props) => {
    const [tippyVisible, setTippyVisible] = useState(false);
    const [tippyFadeOut, setTippyFadeOut] = useState(false);

    const clickHandler = useCallback(() => {
        (props.onClick ?? emptyFn)();

        setTippyVisible(true);
    }, [props.onClick]);

    const [debounce, onClick] = useDebounce(clickHandler, 5);

    useEffect(() => {
        if (tippyVisible) {
            const timers: Array<NodeJS.Timeout> = [];

            const timer = setTimeout(() => {
                setTippyFadeOut(true);

                timers.push(
                    setTimeout(() => {
                        setTippyFadeOut(false);
                        setTippyVisible(false);
                    }, 1 * 1000)
                );
            }, 3 * 1000);

            timers.unshift(timer);

            return () => timers.forEach(x => clearTimeout(x));
        }

        return undefined;
    }, [tippyVisible]);

    return (
        <>
            {tippyVisible &&
                <div className={`tippy ${tippyFadeOut ? "fade-out" : "fade-in"}`}>
                    {props.popupContent ?? "Copied to clipboard"}
                </div>
            }
            <Button
                {...props}
                type="white"
                onClick={onClick}
                icon={{ name: "copy" }}
                disabled={!debounce || (props.disabled ?? false)}
                title={!debounce ? "Button is on cooldown" : (props.title ?? "Copy to clipboard")}
            />
        </>
    );
};

export default CopyToClipboardButton;

/**
 * Get debounced handler
 * @param handler Action to handle
 * @param debounceTime Amount of seconds to stay inactive
 * @returns Pair: current state, is in debounce state; handler with debounce
 */
const useDebounce = (
    handler: () => void,
    debounceTime: number
): [boolean, () => void] => {
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>();

    const debounceHandler = useCallback(() => {
        handler();

        setDebounceTimer(
            setTimeout(() => {
                clearTimeout(debounceTimer!);
                setDebounceTimer(undefined);
            }, debounceTime * 1000)
        );
    }, [handler, debounceTime, debounceTimer]);

    return [isNullOrUndefined(debounceTimer), debounceHandler];
};
