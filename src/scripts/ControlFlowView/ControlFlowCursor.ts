import { ApplicationState } from '../ApplicationState'
import { createElement } from '../utilities/dom'
import { assert } from '../utilities/generic'
import { remap } from '../utilities/math'
import { CFPathState } from './ControlFlowPath'
import { Steps } from './Step'

export type ControlFlowCursor = {
    stepId: string
    element: HTMLElement
    timeMarkerId: string
    isDragging: boolean
}

/**
 * Creates a control flow cursor.
 * @param overrides
 * @returns
 */
export function createControlFlowCursorState(stepId: string): ControlFlowCursor {
    const step = Steps.get(stepId)

    // Element
    const element = createElement('div', 'control-flow-cursor', step.controlFlow.element)

    // TODO
    const base: ControlFlowCursor = {
        stepId: stepId,
        element,
        timeMarkerId: 'main',
        isDragging: false,
    }

    return base
}

export function updateControlFlowCursor(controlFlowCursor: ControlFlowCursor) {
    const action = ApplicationState.actions[controlFlowCursor.stepId]
    const controlFlow = action.controlFlow as CFPathState

    const targetTime = ApplicationState.visualization.selections[controlFlowCursor.selectionId]._globalTime
    const localTime = convertGlobalTimeToLocalTime(targetTime, step.id)

    // TODO Cache

    if (localTime[1] == false) {
        controlFlowCursor.element.classList.add('out-of-range')
    } else {
        controlFlowCursor.element.classList.remove('out-of-range')
    }

    const positionInfo = getPositionAtControlFlow(controlFlow, localTime[0])
    if (positionInfo == null) return

    let { x, y, distanceToEnd, distanceToStart } = positionInfo
    x -= 3.5
    y -= 3.5

    controlFlowCursor.element.style.left = `${x}px`
    controlFlowCursor.element.style.top = `${y}px`

    let scaleEnd = 1
    let opacityEnd = 1
    if (distanceToEnd < 10) {
        scaleEnd = remap(distanceToEnd, 0, 10, 0.8, 1)
        opacityEnd = remap(distanceToEnd, 0, 10, 0.2, 1)
    }

    let scaleStart = 1
    let opacityStart = 1
    if (distanceToStart < 10) {
        scaleStart = remap(distanceToStart, 0, 10, 0.8, 1)
        opacityStart = remap(distanceToStart, 0, 10, 0.2, 1)
    }

    controlFlowCursor.element.style.transform = `scale(${Math.min(scaleEnd, scaleStart)})`
    controlFlowCursor.element.style.opacity = `${Math.min(opacityEnd, opacityStart)}`

    // console.log(
    //     convertGlobalTimeToLocalTime(controlFlowCursor.time, ControlFlowViewInstance.instance.rootStepId as string)
    // )
}

export type CursorPositionInfo = {
    x: number
    y: number
    distanceToEnd: number
    distanceToStart: number
}

export function getPositionAtControlFlow(controlFlow: CFPathState, time: number): CursorPositionInfo | null {
    const paths = controlFlow.flowPathChunks
    let offset = 0

    for (let i = 0; i < paths.length; i++) {
        const path = paths[i]
        const length = path.getTotalLength()

        if (offset + length >= time) {
            const pt = path.getPointAtLength(time - offset)
            return {
                x: pt.x,
                y: pt.y,
                distanceToEnd: length - (time - offset),
                distanceToStart: time - offset,
            }
        }

        offset += length
    }

    return null
}

export function convertGlobalTimeToLocalTime(globalTime: number, stepId: string): [number, boolean] {
    const step = Steps.get(stepId)
    assert(step.isFrame, 'Action must be spatial to convert global time to local time.')

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

    for (let i = 0; i < step.subSteps.length; i++) {
        const vertex = ApplicationState.actions[step.subSteps[i]]

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

export function getTotalDuration(stepId: string): number {
    const step = Steps.get(stepId)

    if (step.subSteps.length > 0) {
        let duration = 0
        let localEnd = action.startTime

        for (let i = 0; i < step.subSteps.length; i++) {
            const vertex = ApplicationState.actions[step.subSteps[i]]
            const delta = vertex.startTime - localEnd

            if (!isNaN(delta) && !vertex.isSpatial) {
                duration += delta
            }

            duration += getTotalDuration(step.subSteps[i])
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
