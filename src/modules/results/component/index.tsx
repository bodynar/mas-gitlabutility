import { FC, useMemo } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

import { isNullOrUndefined } from "@bodynarf/utils";
import { ElementPosition, usePagination } from "@bodynarf/react.components";
import Icon from "@bodynarf/react.components/components/icon/component";
import Paginator from "@bodynarf/react.components/components/paginator";

import "./style.scss";

import { ActionResult, ActionResultState, OperationResult, actionToDescriptionMap } from "@app/models";
import { GlobalAppState } from "@app/store";

/** Props of @see OperationsResults */
interface OperationsResultsProps {
    /** Results of the operations performed */
    items: Array<OperationResult<any>>;
}

/** Box with performed operations results component */
const OperationsResults: FC<OperationsResultsProps> = ({
    items,
}) => {
    const [{ currentPage, pagesCount, onPageChange }, paginate] = usePagination(items.length, 10);
    const pageItems: Array<OperationResult<any>> = useMemo(
        () => paginate(items),
        [paginate, items]
    );

    if (items.length === 0) {
        return (<>
            <p className="has-text-grey has-text-wrapped has-text-centered">
                No results to display
                {`\n`}
                Complete any action to see something here
                {`\n`}
                {`(●'◡'●)`}
            </p>
        </>);
    }

    return (
        <section>
            <div className="block columns is-align-items-center">
                <div className="column is-2">
                    <span className="has-text-weight-bold">Results</span>: {items.length}
                </div>
            </div>
            <div className="menu">
                <ul className="menu-list">
                    {pageItems.map(x =>
                        <li
                            key={x.id}
                            role="result-item"
                        >
                            <Link
                                to={`/r/${x.id}`}
                                className="is-flex is-justify-content-space-between"
                            >
                                <div>
                                    <ItemIcon status={x.result?.status} />
                                    [{x.createdOn.format("DD.MM hh:mm:ss")}] Operation <span className="has-text-weight-bold">
                                        #{x.shortId}
                                    </span>
                                    : {actionToDescriptionMap.get(x.action)}
                                </div>
                                <span role="navigation">
                                    <Icon name="arrow-right" />
                                </span>
                            </Link>
                        </li>
                    )}
                </ul>
            </div>
            <Paginator
                showNextButtons
                nearPagesCount={1}
                count={pagesCount}
                currentPage={currentPage}
                onPageChange={onPageChange}
                position={ElementPosition.Right}
            />
        </section>
    );
};

export default connect(
    ({ gitlab }: GlobalAppState) => ({
        items: gitlab.operationsResults,
    } as Partial<OperationsResultsProps>),
    {}
)(OperationsResults);

/** Props type of `ItemIcon` */
type ItemIconProps = Pick<OperationResult<any>, "error"> & Partial<Pick<ActionResult, "status">>;

/** Result list item icon */
const ItemIcon: FC<ItemIconProps> = ({
    error, status
}) => {
    if (!isNullOrUndefined(error)) {
        return <Icon
            name="exclamation-circle"
            className="mr-2 has-text-danger"
            title="Error aborted the execution"
        />;
    }

    switch (status) {
        case ActionResultState.error:
            return <Icon
                name="exclamation-circle"
                className="mr-2 has-text-danger"
                title="Error have aborted execution"
            />;
        case ActionResultState.cancelled:
            return <Icon
                name="x-circle"
                className="mr-2 has-text-danger"
                title="You have aborted the execution"
            />;
        case ActionResultState.success:
            return <Icon
                name="check2"
                className="mr-2 has-text-success"
                title="Execution completed without any errors"
            />;
        case ActionResultState.warn:
            return <Icon
                name="exclamation-triangle"
                className="Execution completed, but with some errors"
            />;
    }
};
