import { ApplicationState } from '../../../ApplicationState'
import { getLeafSteps } from '../../../utilities/action'
import { createPathElement, createSVGElement } from '../../../utilities/dom'
import { bboxContains, catmullRomSolve } from '../../../utilities/math'
import { ActionState } from '../Action'

/* ------------------------------------------------------ */
/*                      Control flow                      */
/* ------------------------------------------------------ */
export interface ControlFlowState {
    container: SVGElement | undefined
    overlayContainer: SVGElement | undefined

    flowPath: SVGPathElement
    flowPathCompleted: SVGPathElement
    flowPathOverlay: SVGPathElement
}

/**
 * Creates a control flow state.
 * @param overrides
 * @returns
 */
export function createControlFlowState(
    overrides: Partial<ControlFlowState> = {}
): ControlFlowState {
    // Containers
    const container = createSVGElement('control-flow-svg')
    const overlayContainer = createSVGElement([
        'control-flow-svg',
        'control-flow-svg-overlay',
    ])

    // Paths
    const flowPath = createPathElement('control-flow-path')
    const flowPathCompleted = createPathElement(
        'control-flow-path-completed',
        container
    )
    const flowPathOverlay = createPathElement(
        'control-flow-path-overlay',
        overlayContainer
    )

    const base: ControlFlowState = {
        container: container,
        overlayContainer: overlayContainer,

        flowPath: flowPath,
        flowPathCompleted: flowPathCompleted,
        flowPathOverlay: flowPathOverlay,
    }

    return { ...base, ...overrides }
}

export function destroyControlFlow(controlFlow: ControlFlowState) {
    controlFlow.container?.remove()
    controlFlow.overlayContainer?.remove()

    controlFlow.container = undefined
    controlFlow.overlayContainer = undefined
}

export function updateControlFlowState(
    controlFlow: ControlFlowState,
    program: ActionState
) {
    if (
        controlFlow.container == undefined ||
        controlFlow.overlayContainer == undefined
    ) {
        throw new Error('Control flow state is not initialized')
    }

    // Get all control flow points
    const controlFlowPoints = []
    const containerBbox = controlFlow.container.getBoundingClientRect()

    const points = program.representation.getControlFlow(program)

    if (points == null) {
        return
    }

    points.forEach((point) => (point[0] -= containerBbox.left))
    points.forEach((point) => (point[1] -= containerBbox.top))
    controlFlowPoints.push(...points)

    // End point
    // controlFlowPoints.push([10, this.mapping.element.getBoundingClientRect().bottom])

    // if (controlFlowPoints.length > 1) {
    //     // const sx = controlFlowPoints[1][0]
    //     // controlFlowPoints[0][0] = sx

    //     const ex = controlFlowPoints[controlFlowPoints.length - 2][0]
    //     controlFlowPoints[controlFlowPoints.length - 1][0] = ex
    // }

    // const t = performance.now()
    const d = catmullRomSolve(controlFlowPoints.flat(), 0)
    controlFlow.flowPath.setAttribute('d', d)

    // Update completed flow path
    controlFlow.flowPathCompleted.setAttribute('d', d)
    controlFlow.flowPathCompleted.style.strokeDasharray = `${controlFlow.flowPath.getTotalLength()}`
    controlFlow.flowPathCompleted.style.strokeDashoffset = `${controlFlow.flowPath.getTotalLength()}`

    // Update overlay flow path
    controlFlow.flowPathOverlay.setAttribute('d', d)

    // Update timings of step proxies
    const leafSteps = getLeafSteps(
        ApplicationState.visualization.program?.vertices ?? []
    )
    const pathBbox = controlFlow.container.getBoundingClientRect()

    for (let t = 0; t < controlFlow.flowPath.getTotalLength(); t += 1) {
        const point = controlFlow.flowPath.getPointAtLength(t)
        point.x += pathBbox.left
        point.y += pathBbox.top

        const next = leafSteps[0]
        if (next == null) break

        const proxy = next.proxy
        const nextIndicatorBBox = proxy.element.getBoundingClientRect()

        if (
            bboxContains(nextIndicatorBBox, {
                x: point.x,
                y: point.y,
                width: 1,
                height: 1,
            })
        ) {
            leafSteps.shift()
            proxy.timeOffset = t
        }
    }
}
