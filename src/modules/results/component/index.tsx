import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { connect } from "react-redux";

import { isNullish, isNullOrUndefined } from "@bodynarf/utils";
import { ElementPosition, usePagination } from "@bodynarf/react.components";
import Icon from "@bodynarf/react.components/components/icon/component";
import Paginator from "@bodynarf/react.components/components/paginator";

import { ActionResult, ActionResultState, OperationResult, Session } from "@app/models";
import { getLocalizedText } from "@app/locale";
import { GlobalAppState } from "@app/store";
import { appSession } from "@app/shared/values";
import { getActionDescription } from "@app/core/gitlab/actions";

import SessionSelector from "@app/shared/components/sessionSelector";

import "./style.scss";

/** Props of @see OperationsResults */
type OperationsResultsProps = {
    /** Results of the operations performed */
    results: Array<OperationResult<ActionResult>>;
};

/** Box with performed operations results component */
const OperationsResults: FC<OperationsResultsProps> = ({
    results,
}) => {
    const [items, setItems] = useState(
        results.filter(({ sessionId }) => sessionId === appSession.id)
    );

    const onSessionSelectionChange = useCallback(
        (selectedSession: Session) =>
            setItems(
                results.filter(({ sessionId }) => sessionId === selectedSession.id)
            )
        , [results]
    );

    const [{ currentPage, pagesCount, onPageChange }, paginate] = usePagination(items.length, 10);
    const pageItems: Array<OperationResult<ActionResult>> = useMemo(
        () => paginate(items),
        [paginate, items]
    );

    const location = useLocation();

    useEffect(() => {
        if (!isNullish(location.state) && !isNullish(location.state.sessionItem)) {
            setItems(
                results.filter(({ sessionId }) => sessionId === location.state.sessionItem.id)
            );
        }
    }, [location.state, results]);

    return (
        <section>
            <div className="block">
                <SessionSelector
                    mode="Results"
                    defaultValue={location.state?.sessionItem}
                    onSessionSelected={onSessionSelectionChange}
                />
            </div>
            <div className="block columns is-align-items-center">
                <div className="column is-2">
                    <span className="has-text-weight-bold">
                        {getLocalizedText("app.menu.resultsMenuItemCaption")}
                    </span>: {items.length}
                </div>
            </div>
            {pageItems.length === 0
                &&
                <p className="has-text-grey has-text-wrapped has-text-centered">
                    {getLocalizedText("results.noItemsToDisplayError")}
                </p>
            }
            {pageItems.length > 0 &&
                <>
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
                                            <ItemIcon
                                                status={x.result?.status}
                                                error={x.error}
                                            />
                                            [{x.createdOn.format("DD.MM HH:mm:ss")}] {getLocalizedText("results.operation")} <span className="has-text-weight-bold">
                                                #{x.shortId}
                                            </span>
                                            : {getActionDescription(x.action)}
                                        </div>
                                        <span role="navigation">
                                            <Icon
                                                name="arrow-right"
                                                title={getLocalizedText("results.openDetails")}
                                            />
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

                        resources={{
                            nextPageCaption: getLocalizedText("shared.paginator.nextPageCaption"),
                            nextPageTitle: getLocalizedText("shared.paginator.nextPageTitle"),
                            openConcretePageTitleTemplate: getLocalizedText("shared.paginator.openConcretePageTitleTemplate"),
                            previousPageCaption: getLocalizedText("shared.paginator.previousPageCaption"),
                            previousPageTitle: getLocalizedText("shared.paginator.previousPageTitle")
                        }}
                    />
                </>
            }
        </section>
    );
};

export default connect(
    ({ gitlab }: GlobalAppState) => ({
        results: gitlab.operationsResults,
    } as Partial<OperationsResultsProps>),
    {}
)(OperationsResults);

/** Props type of `ItemIcon` */
type ItemIconProps =
    Pick<OperationResult<ActionResult>, "error">
    & Partial<Pick<ActionResult, "status">>;

/** Result list item icon */
const ItemIcon: FC<ItemIconProps> = ({
    error, status
}) => {
    if (!isNullOrUndefined(error)) {
        return <Icon
            name="exclamation-circle"
            className="mr-2 has-text-danger"
            title={getLocalizedText("results.resultTitleError")}
        />;
    }

    switch (status) {
        case ActionResultState.error:
            return <Icon
                name="exclamation-circle"
                className="mr-2 has-text-danger"
                title={getLocalizedText("results.resultTitleError")}
            />;
        case ActionResultState.cancelled:
            return <Icon
                name="x-circle"
                className="mr-2 has-text-danger"
                title={getLocalizedText("results.youHaveAbortedExecution")}
            />;
        case ActionResultState.success:
            return <Icon
                name="check2"
                className="mr-2 has-text-success"
                title={getLocalizedText("results.resultTitleSuccess")}
            />;
        case ActionResultState.warn:
            return <Icon
                name="exclamation-triangle"
                className="mr-2 has-text-warn--md"
                title={getLocalizedText("results.resultTitleWarn")}
            />;
    }
};
