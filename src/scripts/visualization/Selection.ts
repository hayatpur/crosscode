import { ApplicationState } from '../ApplicationState'
import { getTotalDuration } from '../renderer/Action/Mapping/ControlFlowCursor'
import { queryAction } from '../utilities/action'
import { overLerp } from '../utilities/math'

export type SelectionState = {
    id: string

    targetGlobalTime: number
    _globalTime: number
    selectedActionIds: Set<string>
}

let SELECTION_ID = 0
export function createSelection(overrides: Partial<SelectionState> = {}, isMain: boolean): SelectionState {
    const base: SelectionState = {
        id: isMain ? 'main' : `SecondarySelection(${SELECTION_ID++})`,
        targetGlobalTime: 0,
        _globalTime: 0,
        selectedActionIds: new Set(),
    }

    document.addEventListener('keydown', (e) => {
        // If pressed right arrow key
        if (e.key == 'ArrowRight') {
            goToNextStepSelection(base.id)
        }

        // If pressed left arrow key
        if (e.key == 'ArrowLeft') {
            goToPrevStepSelection(base.id)
        }

        // If pressed right arrow key
        if (e.key == 'ArrowUp') {
            // Seek back
            base.targetGlobalTime = Math.max(0, base.targetGlobalTime - 1)
        }

        // If pressed left arrow key
        if (e.key == 'ArrowDown') {
            // Seek forward
            base.targetGlobalTime = Math.min(
                getTotalDuration(ApplicationState.visualization.programId!),
                base.targetGlobalTime + 1
            )
        }
    })

    Object.assign(base, overrides)

    return base
}

export function updateSelectionTime(selectionId: string) {
    const selection = ApplicationState.visualization.selections[selectionId]

    let newTime = overLerp(selection._globalTime, selection.targetGlobalTime, 0.05, 3)
    let different = Math.abs(newTime - selection._globalTime) > 0.0001
    selection._globalTime = newTime

    if (different) {
        updateSelectionActions(selection)
    }
}

export function updateSelectionActions(selection: SelectionState) {
    const newSelections = getSelections(selection._globalTime).selectedIds

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

export type SelectionInfo = {
    selectedIds: Set<string>
    closestId: string | null

    amounts: { [key: string]: number }
}

/**
 * @param time global time
 * @returns
 */
export function getSelections(time: number): SelectionInfo {
    const newSelections: Set<string> = new Set()
    const amounts: { [key: string]: number } = {}

    let closestAction: string | null = null
    let closestDistance = Infinity

    // console.log('-----')
    for (const [id, action] of Object.entries(ApplicationState.actions)) {
        if (action.representation.isFrame()) {
            if (action.globalTimeOffset < time && time <= action.globalTimeOffset + getTotalDuration(action.id)) {
                newSelections.add(id)
                // console.log('Adding', id, clone(ApplicationState.actions[id]))
                amounts[id] = (time - action.globalTimeOffset) / getTotalDuration(action.id)
            } else {
                let distances = [
                    Math.abs(action.globalTimeOffset - time),
                    Math.abs(action.globalTimeOffset + getTotalDuration(action.id) - time),
                ]
                let distance = Math.min(...distances)

                if (distance < closestDistance) {
                    closestAction = id
                    closestDistance = distance
                    amounts[id] = distances[0] < distances[1] ? 0 : 1
                }
            }
        }
        // else if (action.isShowingSteps) {
        //     // TODO

        //     const preStart = action.globalTimeOffset
        //     const preEnd = preStart + action.representation.getPreDuration()

        //     if (preStart <= time && time <= preEnd) {
        //         newSelections.add(id)
        //         amounts[id] = (time - preStart) / (preEnd - preStart)
        //         continue
        //     }

        //     const postStart = preEnd + getTotalDuration(action.id)
        //     const postEnd = postStart - action.representation.getPostDuration()

        //     if (postStart <= time && time <= postEnd) {
        //         newSelections.add(id)
        //         amounts[id] = (time - postStart) / (postEnd - postStart)
        //         continue
        //     }
        // }
    }

    // Filter out parents of selected actions
    for (const id of newSelections) {
        const action = ApplicationState.actions[id]
        const hasChildSelected = queryAction(action, (child) => child.id != id && newSelections.has(child.id)) != null
        if (hasChildSelected) {
            newSelections.delete(id)
        }
    }

    // Add spatial parents
    // for (const id of newSelections) {
    //     const action = ApplicationState.actions[id]
    //     const spatialParent = ApplicationState.actions[action.spatialParentID!]
    //     if (spatialParent.execution.nodeData.type != 'Program') {
    //         const spatialParentParent = ApplicationState.actions[spatialParent.parentID!]
    //         newSelections.add(spatialParentParent.id)
    //     }
    // }

    return { selectedIds: newSelections, closestId: closestAction, amounts }
}

// export function getClosestSelection(time: number, shouldHover: boolean = true): [Set<string>, { [key: string]: number }] {
//     const amounts: { [key: string]: number } = {}

//     let closestAction: string | undefined = undefined
//     let closestTime = Infinity

//     for (const [id, action] of Object.entries(ApplicationState.actions)) {
//         if (
//             (!shouldHover || action.representation.shouldHover) &&
//             action.globalTimeOffset <= time &&
//             time <= action.globalTimeOffset + getTotalDuration(action.id)
//         ) {
//             amounts[id] = (time - action.globalTimeOffset) / getTotalDuration(action.id)
//         }
//     }

//     // Filter out parents of selected actions
//     for (const id of newSelections) {
//         const action = ApplicationState.actions[id]
//         const hasChildSelected = queryAction(action, (child) => child.id != id && newSelections.has(child.id)) != null
//         if (hasChildSelected) {
//             newSelections.delete(id)
//         }
//     }

//     return [newSelections, amounts]
// }

export function goToNextStepSelection(selectionId: string) {
    const selection = ApplicationState.visualization.selections[selectionId]
    const currentSelections = [...selection.selectedActionIds]

    if (currentSelections.length == 0) {
        console.warn('No selection.')
        return
    }

    let furthestSelection = null
    let furthestTime = -Infinity

    for (const id of currentSelections) {
        const action = ApplicationState.actions[id]
        const endTime = action.globalTimeOffset + getTotalDuration(id)

        if (endTime > furthestTime) {
            furthestTime = endTime
            furthestSelection = id
        }
    }

    // Find the action that is after the furthest selection
    let nextActionId = null
    let nextActionDistance = Infinity

    for (const id of Object.keys(ApplicationState.actions)) {
        if (id == furthestSelection) continue

        const action = ApplicationState.actions[id]

        if (!action.representation.isFrame()) continue

        const distance = action.globalTimeOffset - furthestTime

        if (distance > 0 && distance < nextActionDistance) {
            nextActionDistance = distance
            nextActionId = id
        }
    }

    if (nextActionId != null) {
        const nextAction = ApplicationState.actions[nextActionId]
        selection.targetGlobalTime = nextAction.globalTimeOffset + getTotalDuration(nextActionId)
    }
}

export function goToPrevStepSelection(selectionId: string) {
    const selection = ApplicationState.visualization.selections[selectionId]
    const currentSelections = [...selection.selectedActionIds]

    if (currentSelections.length == 0) {
        console.warn('No selection.')
        return
    }

    let furthestSelection = null
    let furthestTime = -Infinity

    for (const id of currentSelections) {
        const action = ApplicationState.actions[id]
        const endTime = action.globalTimeOffset + getTotalDuration(id)

        if (endTime > furthestTime) {
            furthestTime = endTime
            furthestSelection = id
        }
    }

    // Find the action that is before the furthest selection
    let nextActionId = null
    let nextActionDistance = -Infinity

    for (const id of Object.keys(ApplicationState.actions)) {
        if (id == furthestSelection) continue

        const action = ApplicationState.actions[id]

        if (!action.representation.isFrame()) continue

        const distance = action.globalTimeOffset - furthestTime

        if (distance < 0 && distance > nextActionDistance) {
            nextActionDistance = distance
            nextActionId = id
        }
    }

    if (nextActionId != null) {
        const nextAction = ApplicationState.actions[nextActionId]
        selection.targetGlobalTime = nextAction.globalTimeOffset + getTotalDuration(nextActionId)
    }
}

export function getSpatialActionsPathFromRoot(selectionId = 'main') {
    const selection = ApplicationState.visualization.selections[selectionId]
    const program = ApplicationState.actions[ApplicationState.visualization.programId!]
    const time = selection._globalTime

    const path: string[] = [program.id]

    while (true) {
        const lastAction = ApplicationState.actions[path[path.length - 1]]
        const candidates = lastAction.spatialVertices

        let closestCandidate: string | null = null
        let closestDistance = Infinity

        for (const candidateId of candidates) {
            const candidate = ApplicationState.actions[candidateId]

            let distances = [
                Math.abs(candidate.globalTimeOffset - time),
                Math.abs(candidate.globalTimeOffset + getTotalDuration(candidate.id) - time),
            ]

            let distance = Math.min(...distances)

            if (distance < closestDistance) {
                closestCandidate = candidateId
                closestDistance = distance
            }
        }

        if (closestCandidate == null) {
            break
        }

        path.push(closestCandidate)
    }

    // const currentSelections = getSelections(selection._globalTime)

    // const closest = ApplicationState.actions[currentSelections.closestId!]
    // const closestSpatial = ApplicationState.actions[closest.spatialParentID!]

    // const path = [closestSpatial]

    // let spatialAncestor = (action: ActionState) => {
    //     if (action.parentID == null) return null

    //     const parent = ApplicationState.actions[action.parentID]
    //     return ApplicationState.actions[parent.spatialParentID!]
    // }

    // while (spatialAncestor(path[path.length - 1]) != null) {
    //     path.push(spatialAncestor(path[path.length - 1])!)
    // }

    // path.reverse()

    return path
}

export function destroySelection(selectionState: SelectionState) {
    selectionState.selectedActionIds.clear()
}
