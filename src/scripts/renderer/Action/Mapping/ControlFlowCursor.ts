import { ApplicationState } from '../../../ApplicationState'
import { createElement } from '../../../utilities/dom'
import { assert } from '../../../utilities/generic'
import { ControlFlowState } from './ControlFlowState'

export type ControlFlowCursor = {
    actionId: string
    element: HTMLElement
    selectionId: string
    isDragging: boolean
}

/**
 * Creates a control flow cursor.
 * @param overrides
 * @returns
 */
export function createControlFlowCursorState(overrides: Partial<ControlFlowCursor> = {}): ControlFlowCursor {
    assert(overrides.actionId !== undefined, 'Action ID must be defined for control flow state.')
    // assert(overrides.selectionId !== undefined, 'Selection ID must be defined for control flow state.')

    const action = ApplicationState.actions[overrides.actionId]

    // Element
    const element = createElement('div', 'control-flow-cursor', action.proxy.element)

    // TODO
    const base: ControlFlowCursor = {
        actionId: overrides.actionId,
        element,
        selectionId: 'main',
        isDragging: false,
    }

    return { ...base, ...overrides }
}

export function updateControlFlowCursor(controlFlowCursor: ControlFlowCursor) {
    const action = ApplicationState.actions[controlFlowCursor.actionId]
    const controlFlow = action.controlFlow as ControlFlowState

    const targetTime = ApplicationState.visualization.selections[controlFlowCursor.selectionId]._globalTime
    const localTime = convertGlobalTimeToLocalTime(targetTime, action.id)

    // TODO Cache

    if (localTime[1] == false) {
        controlFlowCursor.element.classList.add('out-of-range')
    } else {
        controlFlowCursor.element.classList.remove('out-of-range')
    }

    let { x, y } = getPositionAtControlFlow(controlFlow, localTime[0])
    x -= 3.5
    y -= 3.5

    controlFlowCursor.element.style.left = `${x}px`
    controlFlowCursor.element.style.top = `${y}px`

    // console.log(
    //     convertGlobalTimeToLocalTime(controlFlowCursor.time, ApplicationState.visualization.programId as string)
    // )
}

export function getPositionAtControlFlow(controlFlow: ControlFlowState, time: number) {
    const path = controlFlow.flowPath
    return path.getPointAtLength(time)
}

export function convertGlobalTimeToLocalTime(globalTime: number, actionId: string): [number, boolean] {
    const action = ApplicationState.actions[actionId]
    assert(action.isSpatial, 'Action must be spatial to convert global time to local time.')

    let globalOffset = action.globalTimeOffset
    let localOffset = 0
    let localEnd = action.startTime
    // globalTime -= offset

    // Three cases, it can either be:
    // 1. In between two vertices
    // 2. Inside a vertex
    // 3. Outside start or end vertices

    // Check for 3.
    if (globalTime < globalOffset) {
        return [localOffset, false]
    }

    for (let i = 0; i < action.vertices.length; i++) {
        const vertex = ApplicationState.actions[action.vertices[i]]

        // Add length in between vertices
        let delta = vertex.startTime - localEnd
        if (isNaN(delta)) {
            delta = 0
        }
        globalOffset += delta
        localOffset += delta

        // Check for 1.
        if (globalTime <= globalOffset) {
            return [localOffset - (globalOffset - globalTime), true]
        }

        // Add duration of vertex
        let globalDuration = getTotalDuration(vertex.id)
        let localDuration = vertex.endTime - vertex.startTime
        globalOffset += globalDuration
        localOffset += localDuration

        // Check for 2.
        if (globalTime <= globalOffset) {
            return [localOffset - (localDuration * (globalOffset - globalTime)) / globalDuration, true]
        }

        localEnd = vertex.endTime
    }

    // Final delta check
    let delta = action.endTime - localEnd
    if (isNaN(delta) || !action.representation.isSelectableGroup) {
        delta = 0
    }
    globalOffset += delta
    localOffset += delta
    if (globalTime <= globalOffset) {
        return [localOffset - (globalOffset - globalTime), true]
    }

    return [localOffset, false]
}

export function getTotalDuration(actionId: string): number {
    const action = ApplicationState.actions[actionId]

    if (action.vertices.length > 0) {
        let duration = 0
        let localEnd = action.startTime

        for (let i = 0; i < action.vertices.length; i++) {
            const vertex = ApplicationState.actions[action.vertices[i]]
            const delta = vertex.startTime - localEnd

            if (!isNaN(delta)) {
                duration += delta
            }

            duration += getTotalDuration(action.vertices[i])
            localEnd = vertex.endTime
        }

        const delta = action.endTime - localEnd
        if (!isNaN(delta) && action.representation.isSelectableGroup) {
            duration += delta
        }

        return duration
    } else {
        let duration = action.endTime - action.startTime
        if (isNaN(duration)) {
            duration = 0
        }
        return duration
    }
}
