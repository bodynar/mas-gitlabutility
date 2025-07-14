import { FC } from "react";

import "./styles.scss";

/** Props of `ProgressBar` */
type ProgressBarProps = {
    /** Current state value */
    value: number;

    /** Maximum value */
    max: number;
};

/** Bar to represent a state during some operation */
const ProgressBar: FC<ProgressBarProps> = ({
    value, max
}) => {
    const percentage = Math.min(
        100,
        (value / max) * 100
    );

    return (
        <div className="progress-bar">
            <div
                className="progress-bar__fill"
                style={{ maxWidth: `${percentage}%` }}
            />
        </div>
    );
};

export default ProgressBar;
