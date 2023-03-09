import { createPathElement, createSVGElement } from '../utilities/dom'
import { createControlFlowCursorState } from './ControlFlowCursor'
import { Steps } from './Step'

/* ------------------------------------------------------ */
/*                      Control flow                      */
/* ------------------------------------------------------ */
export type CFPathState = {
    stepId: string

    container: SVGElement | undefined
    overlayContainer: SVGElement | undefined

    flowPathChunks: SVGPathElement[]
    actionRadii: SVGCircleElement[]
    pathCache: string
}

export namespace CFPath {
    /**
     * Creates a control flow state.
     * @param overrides
     * @returns
     */
    export function createCFPathState(stepId: string): CFPathState {
        const step = Steps.get(stepId)

        // Containers
        const container = createSVGElement('control-flow-svg', step.controlFlow.element)
        const overlayContainer = createSVGElement(
            ['control-flow-svg', 'control-flow-svg-overlay'],
            step.controlFlow.element
        )

        // Paths
        const flowPath = createPathElement('control-flow-path', container)

        const base: CFPathState = {
            stepId: stepId,
            container: container,
            overlayContainer: overlayContainer,
            actionRadii: [],
            flowPathChunks: [flowPath],
            cursor: createControlFlowCursorState(stepId),
            pathCache: '',
        }

        return base
    }

    export function createControlFlowPathFragment(container: HTMLElement) {
        return createPathElement('control-flow-path-overlay', container)
    }

    // export function destroyControlFlowPath(controlFlow: ControlFlowPathState) {
    //     controlFlow.container?.remove()
    //     controlFlow.overlayContainer?.remove()

    //     controlFlow.container = undefined
    //     controlFlow.overlayContainer = undefined
    // }

    // export function updateControlFlowPath(controlFlow: ControlFlowPathState, forceUpdate: boolean = false) {
    //     assert(
    //         controlFlow.container != undefined && controlFlow.overlayContainer != undefined,
    //         'Control flow state is not initialized'
    //     )
    //     const action = Steps.get(controlFlow.stepId)

    //     // Exit early if no change
    //     let wasUpdated = false
    //     const cached = action.representation.getControlFlowCache(step.id)
    //     if (cached != controlFlow.pathCache || forceUpdate) {
    //         // Reset control flow
    //         resetPathChunks(controlFlow.flowPathChunks)

    //         // Update control flow
    //         action.representation.updateControlFlow(controlFlow, step.id)

    //         // Update spatial offsets
    //         updateSpatialOffsets(ControlFlowViewInstance.instance.rootStepId as string)

    //         // Update cache
    //         controlFlow.pathCache = cached
    //         wasUpdated = true
    //     }

    //     // Update cursor
    //     updateControlFlowCursor(controlFlow.cursor)

    //     return wasUpdated
    // }

    // export function updateSpatialOffsets(stepId: string, offset: number = 0) {
    //     const step = Steps.get(stepId)

    //     if (step.steps.length > 0) {
    //         let duration = 0
    //         let localEnd = action.startTime

    //         action.globalTimeOffset = offset

    //         for (let i = 0; i < step.steps.length; i++) {
    //             const vertex = ApplicationState.actions[step.steps[i]]
    //             const delta = vertex.startTime - localEnd

    //             // console.log(
    //             //     'Start time',
    //             //     vertex.execution.nodeData.type,
    //             //     vertex.startTime,
    //             //     '...',
    //             //     localEnd,
    //             //     delta,
    //             //     duration,
    //             //     offset
    //             // )

    //             // console.log(offset, duration, delta, localEnd)
    //             if (!isNaN(delta) && !vertex.isSpatial) {
    //                 duration += delta
    //             }

    //             // if (i == 0 && step.isFrame) {
    //             //     console.log(
    //             //         step.id,
    //             //         'adding',
    //             //         duration,
    //             //         'to',
    //             //         offset,
    //             //         '\nvertexStart:',
    //             //         vertex.startTime,
    //             //         'localEnd:',
    //             //         localEnd
    //             //     )
    //             //     console.log(action)
    //             // }

    //             duration += updateSpatialOffsets(vertex.id, offset + duration)
    //             localEnd = vertex.endTime
    //             // console.log('End time', vertex.execution.nodeData.type, localEnd)
    //         }

    //         const delta = action.endTime - localEnd
    //         if (!isNaN(delta) && action.representation.isSelectableGroup) {
    //             duration += delta
    //         }

    //         return duration
    //     } else {
    //         action.globalTimeOffset = offset

    //         let duration = action.endTime - action.startTime
    //         if (isNaN(duration)) {
    //             duration = 0
    //         }

    //         return duration
    //     }
    // }

    // export function getRadius(action: StepState) {
    //     return Math.max(2, step.controlFlowRenderer.element.getBoundingClientRect().height / 2.5)
    // }
}
