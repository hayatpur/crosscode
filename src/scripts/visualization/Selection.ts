import { ApplicationState } from '../ApplicationState'
import { getTotalDuration } from '../renderer/Action/Mapping/ControlFlowCursor'
import { queryAction } from '../utilities/action'
import { overLerp } from '../utilities/math'

export type SelectionState = {
    targetGlobalTime: number
    _globalTime: number
    selectedActionIds: Set<string>
}

export function createSelection(overrides: Partial<SelectionState> = {}): SelectionState {
    const base: SelectionState = {
        targetGlobalTime: 0,
        _globalTime: 0,
        selectedActionIds: new Set(),
    }

    Object.assign(base, overrides)

    return base
}

export function updateSelectionTime(selection: SelectionState) {
    let newTime = overLerp(selection._globalTime, selection.targetGlobalTime, 0.1, 1)
    let different = Math.abs(newTime - selection._globalTime) > 0.0001
    selection._globalTime = overLerp(selection._globalTime, selection.targetGlobalTime, 0.1, 1)

    if (different) {
        updateSelectionActions(selection)
    }
}

export function updateSelectionActions(selection: SelectionState) {
    const newSelections = getSelections(selection.targetGlobalTime)[0]

    // Add new
    for (const id of newSelections) {
        if (!selection.selectedActionIds.has(id)) {
            selection.selectedActionIds.add(id)
            ApplicationState.actions[id].representation.select()
        }
    }

    // Remove old
    for (const id of selection.selectedActionIds) {
        if (!newSelections.has(id)) {
            selection.selectedActionIds.delete(id)
            ApplicationState.actions[id].representation.deselect()
        }
    }
}

/**
 * @param time global time
 * @returns
 */
export function getSelections(time: number, shouldHover: boolean = true): [Set<string>, { [key: string]: number }] {
    const newSelections: Set<string> = new Set()
    const amounts: { [key: string]: number } = {}

    for (const [id, action] of Object.entries(ApplicationState.actions)) {
        if (
            (!shouldHover || action.representation.shouldHover) &&
            action.globalTimeOffset <= time &&
            time <= action.globalTimeOffset + getTotalDuration(action.id)
        ) {
            newSelections.add(id)
            amounts[id] = (time - action.globalTimeOffset) / getTotalDuration(action.id)
        }
    }

    // Filter out parents of selected actions
    for (const id of newSelections) {
        const action = ApplicationState.actions[id]
        const hasChildSelected = queryAction(action, (child) => child.id != id && newSelections.has(child.id)) != null
        if (hasChildSelected) {
            newSelections.delete(id)
        }
    }

    return [newSelections, amounts]
}
