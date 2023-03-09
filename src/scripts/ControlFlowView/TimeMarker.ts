import { ApplicationState } from '../ApplicationState'
import { overLerp } from '../utilities/math'
import { getTotalDuration } from './ControlFlowCursor'
import { deselectStep, selectStep } from './Dynamic/SelectStep'
import { Step, Steps } from './Step'

export type TimeMarkerState = {
    id: string

    targetGlobalTime: number
    _globalTime: number
    selectedActionIds: Set<string>
}

export class TimeMarkers {
    static timeMarkers: { [id: string]: TimeMarkerState } = {}

    static add(timeMarker: TimeMarkerState) {
        TimeMarkers.timeMarkers[timeMarker.id] = timeMarker
    }

    static remove(timeMarker: TimeMarkerState) {
        delete TimeMarkers.timeMarkers[timeMarker.id]
    }

    static get(id: string): TimeMarkerState {
        return TimeMarkers.timeMarkers[id]
    }
}

export namespace TimeMarker {
    let SELECTION_ID = 0

    export function createTimeMarker(isMain: boolean): TimeMarkerState {
        const base: TimeMarkerState = {
            id: isMain ? 'main' : `SecondaryTime(${SELECTION_ID++})`,
            targetGlobalTime: 0,
            _globalTime: 0,
            selectedActionIds: new Set(),
        }

        return base
    }

    export function updateTimeMarker(timeMarker: TimeMarkerState, dt: number) {
        let newTime = overLerp(timeMarker._globalTime, timeMarker.targetGlobalTime, 0.05 * ApplicationState.Speed, 3)
        let different = Math.abs(newTime - timeMarker._globalTime) > 0.0001
        timeMarker._globalTime = newTime

        if (different) {
            updateTimeMarkerActions(timeMarker)
        }
    }

    export function updateTimeMarkerActions(timeMarker: TimeMarkerState) {
        const newSelections = getSelections(timeMarker._globalTime).selectedIds

        // Add new
        for (const id of newSelections) {
            if (!timeMarker.selectedActionIds.has(id)) {
                timeMarker.selectedActionIds.add(id)
                selectStep(id)
            }
        }

        // Remove old
        for (const id of timeMarker.selectedActionIds) {
            if (!newSelections.has(id)) {
                timeMarker.selectedActionIds.delete(id)
                deselectStep(id)
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

        for (const [id, step] of Object.entries(Steps.steps)) {
            if (step.isFrame) {
                if (step.globalTimeOffset < time && time <= step.globalTimeOffset + getTotalDuration(step.id)) {
                    newSelections.add(id)
                    // console.log('Adding', id, clone(Steps.get(id)))
                    amounts[id] = (time - step.globalTimeOffset) / getTotalDuration(step.id)
                } else {
                    let distances = [
                        Math.abs(step.globalTimeOffset - time),
                        Math.abs(step.globalTimeOffset + getTotalDuration(step.id) - time),
                    ]
                    let distance = Math.min(...distances)

                    if (distance < closestDistance) {
                        closestAction = id
                        closestDistance = distance
                        amounts[id] = distances[0] < distances[1] ? 0 : 1
                    }
                }
            }
            // else if (step.isShowingSteps) {
            //     // TODO

            //     const preStart = action.globalTimeOffset
            //     const preEnd = preStart + action.representation.getPreDuration()

            //     if (preStart <= time && time <= preEnd) {
            //         newSelections.add(id)
            //         amounts[id] = (time - preStart) / (preEnd - preStart)
            //         continue
            //     }

            //     const postStart = preEnd + getTotalDuration(step.id)
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
            const step = Steps.get(id)
            const hasChildSelected =
                Step.queryStep(step, (child) => child.id != id && newSelections.has(child.id)) != null
            if (hasChildSelected) {
                newSelections.delete(id)
            }
        }

        // Add spatial parents
        // for (const id of newSelections) {
        //     const step = Steps.get(id)
        //     const spatialParent = Steps.get(step.parentFrameId!)
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
    //             time <= action.globalTimeOffset + getTotalDuration(step.id)
    //         ) {
    //             amounts[id] = (time - action.globalTimeOffset) / getTotalDuration(step.id)
    //         }
    //     }

    //     // Filter out parents of selected actions
    //     for (const id of newSelections) {
    //         const step = Steps.get(id)
    //         const hasChildSelected = queryAction(action, (child) => child.id != id && newSelections.has(child.id)) != null
    //         if (hasChildSelected) {
    //             newSelections.delete(id)
    //         }
    //     }

    //     return [newSelections, amounts]
    // }

    export function goToNextStepSelection(selectionId: string) {
        const selection = TimeMarkers.get(selectionId)
        const currentSelections = [...selection.selectedActionIds]

        if (currentSelections.length == 0) {
            console.warn('No selection.')
            return
        }

        let furthestSelection = null
        let furthestTime = -Infinity

        for (const id of currentSelections) {
            const step = Steps.get(id)
            const endTime = step.globalTimeOffset + getTotalDuration(id)

            if (endTime > furthestTime) {
                furthestTime = endTime
                furthestSelection = id
            }
        }

        // Find the action that is after the furthest selection
        let nextStepId = null
        let nextActionDistance = Infinity

        for (const id of Object.keys(Steps.steps)) {
            if (id == furthestSelection) continue

            const step = Steps.get(id)

            if (!step.isFrame) continue

            const distance = step.globalTimeOffset - furthestTime

            if (distance > 0 && distance < nextActionDistance) {
                nextActionDistance = distance
                nextStepId = id
            }
        }

        if (nextStepId != null) {
            const nextAction = Steps.get(nextStepId)
            selection.targetGlobalTime = nextAction.globalTimeOffset + getTotalDuration(nextStepId)
        }
    }

    export function goToPrevStepSelection(selectionId: string) {
        const selection = TimeMarkers.get(selectionId)
        const currentSelections = [...selection.selectedActionIds]

        if (currentSelections.length == 0) {
            console.warn('No selection.')
            return
        }

        let furthestSelection = null
        let furthestTime = -Infinity

        for (const id of currentSelections) {
            const step = Steps.get(id)
            const endTime = step.globalTimeOffset + getTotalDuration(id)

            if (endTime > furthestTime) {
                furthestTime = endTime
                furthestSelection = id
            }
        }

        // Find the action that is before the furthest selection
        let nextStepId = null
        let nextActionDistance = -Infinity

        for (const id of Object.keys(Steps.steps)) {
            if (id == furthestSelection) continue

            const step = Steps.get(id)

            if (!step.isFrame) continue

            const distance = step.globalTimeOffset - furthestTime

            if (distance < 0 && distance > nextActionDistance) {
                nextActionDistance = distance
                nextStepId = id
            }
        }

        if (nextStepId != null) {
            const nextAction = Steps.get(nextStepId)
            selection.targetGlobalTime = nextAction.globalTimeOffset + getTotalDuration(nextStepId)
        }
    }

    export function getSpatialActionsPathFromRoot(selectionId = 'main') {
        const selection = TimeMarkers.get(selectionId)
        const program = ApplicationState.actions[ControlFlowViewInstance.instance.rootStepId!]
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
        // const closestSpatial = ApplicationState.actions[closest.parentFrameId!]

        // const path = [closestSpatial]

        // let spatialAncestor = (action: StepState) => {
        //     if (step.parentId == null) return null

        //     const parent = Steps.get(step.parentId)
        //     return ApplicationState.actions[parent.parentFrameId!]
        // }

        // while (spatialAncestor(path[path.length - 1]) != null) {
        //     path.push(spatialAncestor(path[path.length - 1])!)
        // }

        // path.reverse()

        return path
    }

    export function destroyTimeMarker(timeMarkerState: TimeMarkerState) {
        timeMarkerState.selectedActionIds.clear()
    }
}
