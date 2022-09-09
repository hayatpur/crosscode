import { ApplicationState } from '../../../ApplicationState'
import { createPathElement, createSVGElement } from '../../../utilities/dom'
import { assert } from '../../../utilities/generic'
import { resetPathChunks } from '../../../utilities/math'
import { ActionState } from '../Action'
import {
    ControlFlowCursor,
    createControlFlowCursorState,
    getTotalDuration,
    updateControlFlowCursor,
} from './ControlFlowCursor'

/* ------------------------------------------------------ */
/*                      Control flow                      */
/* ------------------------------------------------------ */
export type ControlFlowState = {
    actionId: string

    container: SVGElement | undefined
    overlayContainer: SVGElement | undefined

    flowPathChunks: SVGPathElement[]
    actionRadii: SVGCircleElement[]
    pathCache: string

    cursor: ControlFlowCursor
}

/**
 * Creates a control flow state.
 * @param overrides
 * @returns
 */
export function createControlFlowState(overrides: Partial<ControlFlowState> = {}): ControlFlowState {
    assert(overrides.actionId !== undefined, 'Action ID must be defined for control flow state.')

    const action = ApplicationState.actions[overrides.actionId]

    // Containers
    const container = createSVGElement('control-flow-svg', action.proxy.element)
    const overlayContainer = createSVGElement(['control-flow-svg', 'control-flow-svg-overlay'], action.proxy.element)

    // Paths
    const flowPath = createPathElement('control-flow-path', container)
    // const flowPathOverlay = createPathElement('control-flow-path-overlay', overlayContainer)
    // const flowPathCompleted = createPathElement('control-flow-path-completed')

    // const flowPathFragments = [createFlowPathFragment()]

    const base: ControlFlowState = {
        actionId: overrides.actionId,
        container: container,
        overlayContainer: overlayContainer,
        actionRadii: [],
        flowPathChunks: [flowPath],
        cursor: createControlFlowCursorState({ actionId: overrides.actionId }),
        pathCache: '',
    }

    // Setup event listeners
    setupEventListeners(base)

    return { ...base, ...overrides }
}

export function createFlowPathFragment(container: HTMLElement) {
    return createPathElement('control-flow-path-overlay', container)
}

export function setupEventListeners(controlFlow: ControlFlowState) {
    let mousePosition = { x: 0, y: 0 }

    controlFlow.cursor.element.addEventListener('mousedown', (e) => {
        controlFlow.cursor.isDragging = true
        controlFlow.cursor.element.classList.add('is-dragging')

        const selection = ApplicationState.visualization.selections[controlFlow.cursor.selectionId]
        const action = ApplicationState.actions[controlFlow.actionId]

        // selection.globalTime = Math.max(
        //     action.globalTimeOffset,
        //     Math.min(action.globalTimeOffset + getTotalDuration(action.id), selection.globalTime)
        // )

        mousePosition = { x: e.clientX, y: e.clientY }

        e.preventDefault()
        e.stopPropagation()
    })

    document.body.addEventListener('mousemove', (e) => {
        if (controlFlow.cursor.isDragging) {
            const dy = e.clientY - mousePosition.y
            const selection = ApplicationState.visualization.selections[controlFlow.cursor.selectionId]

            selection.targetGlobalTime += dy
            selection.targetGlobalTime = Math.max(
                0,
                Math.min(
                    getTotalDuration(ApplicationState.visualization.programId as string),
                    selection.targetGlobalTime
                )
            )

            mousePosition = { x: e.clientX, y: e.clientY }
        }
    })

    window.addEventListener('mouseup', (e) => {
        if (controlFlow.cursor.isDragging) {
            controlFlow.cursor.isDragging = false
            controlFlow.cursor.element.classList.remove('is-dragging')
        }
    })
}

export function destroyControlFlow(controlFlow: ControlFlowState) {
    controlFlow.container?.remove()
    controlFlow.overlayContainer?.remove()

    controlFlow.container = undefined
    controlFlow.overlayContainer = undefined
}

export function updateControlFlowState(controlFlow: ControlFlowState, forceUpdate: boolean = false) {
    assert(
        controlFlow.container != undefined && controlFlow.overlayContainer != undefined,
        'Control flow state is not initialized'
    )
    const action = ApplicationState.actions[controlFlow.actionId]

    // Exit early if no change
    let wasUpdated = false
    const cached = action.representation.getControlFlowCache(action.id)
    if (cached != controlFlow.pathCache || forceUpdate) {
        // Reset control flow
        resetPathChunks(controlFlow.flowPathChunks)

        // Update control flow
        action.representation.updateControlFlow(controlFlow, action.id)

        // Update spatial offsets
        // if (ApplicationState.visualization.programId == action.id) {
        // console.log(clone(ApplicationState.actions), clone(ApplicationState.visualization.programId))
        updateSpatialOffsets(ApplicationState.visualization.programId as string)
        // }

        // Update cache
        controlFlow.pathCache = cached
        wasUpdated = true
    }

    // Update cursor
    updateControlFlowCursor(controlFlow.cursor)

    return wasUpdated
}

export function updateSpatialOffsets(actionId: string, offset: number = 0) {
    const action = ApplicationState.actions[actionId]

    if (action.vertices.length > 0) {
        let duration = 0
        let localEnd = action.startTime

        action.globalTimeOffset = offset

        for (let i = 0; i < action.vertices.length; i++) {
            const vertex = ApplicationState.actions[action.vertices[i]]
            const delta = vertex.startTime - localEnd

            // console.log(
            //     'Start time',
            //     vertex.execution.nodeData.type,
            //     vertex.startTime,
            //     '...',
            //     localEnd,
            //     delta,
            //     duration,
            //     offset
            // )

            // console.log(offset, duration, delta, localEnd)
            if (!isNaN(delta) && !vertex.isSpatial) {
                duration += delta
            }

            // if (i == 0 && action.isSpatial) {
            //     console.log(
            //         action.id,
            //         'adding',
            //         duration,
            //         'to',
            //         offset,
            //         '\nvertexStart:',
            //         vertex.startTime,
            //         'localEnd:',
            //         localEnd
            //     )
            //     console.log(action)
            // }

            duration += updateSpatialOffsets(vertex.id, offset + duration)
            localEnd = vertex.endTime
            // console.log('End time', vertex.execution.nodeData.type, localEnd)
        }

        const delta = action.endTime - localEnd
        if (!isNaN(delta) && action.representation.isSelectableGroup) {
            duration += delta
        }

        return duration
    } else {
        action.globalTimeOffset = offset

        let duration = action.endTime - action.startTime
        if (isNaN(duration)) {
            duration = 0
        }

        return duration
    }
}

export function getRadius(action: ActionState) {
    return Math.max(2, action.proxy.element.getBoundingClientRect().height / 2.5)
}
