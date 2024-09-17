import { createAction } from "@reduxjs/toolkit";

import { Group, OperationResult } from "@app/models";

/**
 * Set gitlab groups
 * @param _ New groups data
 */
export const setGroups = createAction<Array<Group>>("mas.gua/git/setGroups");

/**
 * Select project for performing next action
 * @param _ Project identifier
 */
export const selectProject = createAction<number>("mas.gua/git/selectProject");

/**
 * Select group for performing next action
 * @param _ Group identifier
 */
export const selectGroup = createAction<number>("mas.gua/git/selectGroup");

/**
 * Remove selection from project for performing next action
 * @param _ Project identifier
 */
export const deselectProject = createAction<number>("mas.gua/git/deselectProject");

/**
 * Remove selection from group for performing next action
 * @param _ Group identifier
 */
export const deselectGroup = createAction<number>("mas.gua/git/deselectGroup");

/** Clear selected projects list */
export const clearSelection = createAction("mas.gua/git/clearSelection");

/** Set all projects as selected */
export const selectAll = createAction("mas.gua/git/selectAll");

/** Add operation result to history */
export const addOperationResult = createAction<OperationResult<any>>("mas.gua/git/addOperationResult");

/**
 * Set search text query
 * @param _ New search value
 */
export const setSearchQuery = createAction<string>("mas.gua/git/setSearchQuery");

/**
 * Update flag of showing version warning
 */
export const markThatVersionWarningWasShown = createAction("mas.gua/git/markWarningWasShown");

/**
 * Save current state of accessibility of api
 * @param _ Is api inaccessible
 */
export const saveApiInInaccessible = createAction<boolean | undefined>("mas.gua/git/saveApiInInaccessible");
