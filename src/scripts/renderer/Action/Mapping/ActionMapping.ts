import { ApplicationState } from '../../../ApplicationState'
import { ExecutionGraph } from '../../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../../execution/primitive/ExecutionNode'
import { getAbstractionPath } from '../../../utilities/action'
import { createElement, createSVGElement } from '../../../utilities/dom'
import { assert } from '../../../utilities/generic'
import { ActionProxyState } from './ActionProxy'
import { ControlFlowState, createControlFlowState, destroyControlFlow } from './ControlFlow'

/* ------------------------------------------------------ */
/*               Stores mapping information               */
/* ------------------------------------------------------ */
export type ActionMappingState = {
    element: HTMLElement
    frames: HTMLElement[]

    // Break indices (occurs between actions[index] and actions[index + 1])
    breaks: number[]
    breakElements: HTMLElement[]

    // Control flow
    controlFlow: ControlFlowState | undefined

    time: number

    // SVG Canvas
    svgElement: SVGElement
}

/**
 * Creates an action mapping.
 * @param overrides
 * @returns
 */
export function createActionMapping(overrides: Partial<ActionMappingState> = {}): ActionMappingState {
    const element = createElement('div', 'action-mapping')
    const svgElement = createSVGElement('action-mapping-svg', element)

    const base: ActionMappingState = {
        element: element,
        frames: [],

        // Break indices (occurs between actions[index] and actions[index + 1])
        breaks: [],
        breakElements: [],

        // Control flow
        controlFlow: createControlFlowState(),
        // cursor: createActionMappingCursorState(),

        time: 0,

        svgElement: svgElement,
    }

    return { ...base, ...overrides }
}

export function destroyActionMapping(actionMapping: ActionMappingState) {
    if (actionMapping.controlFlow !== undefined) {
        destroyControlFlow(actionMapping.controlFlow)
    }
    // destroyActionMappingCursor(actionMapping.cursor)

    actionMapping.element.remove()

    actionMapping.breakElements.forEach((breakEl) => {
        breakEl.remove()
    })

    actionMapping.controlFlow = undefined
    actionMapping.breakElements = []
    actionMapping.breaks = []
    actionMapping.frames = []
    actionMapping.time = 0
}

/**
 * Updates action proxies inside the mapping.
 * @param mapping
 * @param index
 */
export function getBreakIndexOfFrameIndex(mapping: ActionMappingState, index: number): number {
    for (let i = 0; i < mapping.breaks.length; i++) {
        if (mapping.breaks[i] >= index) {
            return i
        }
    }
    return mapping.breaks.length
}

/**
 * @param mapping Action mapping
 * @param index Index of the frame
 */
export function addBreakToMapping(mapping: ActionMappingState, index: number) {
    mapping.breaks.push(index)

    const breakEl = createElement('div', 'action-mapping-break', mapping.element.parentElement as HTMLElement)
    mapping.breakElements.push(breakEl)
}

/**
 * Adds the proxy element to the mapping.
 * @param proxy Action proxy
 * @param mapping Action mapping
 */
export function appendProxyToMapping(proxy: ActionProxyState, mapping: ActionMappingState) {
    if (ApplicationState.actions[proxy.actionID].execution.nodeData.type === 'Program') {
        mapping.element.appendChild(proxy.container)
        return
    }

    const programId = ApplicationState.visualization.programId
    assert(programId != undefined, 'Program ID is undefined')

    const program = ApplicationState.actions[programId]

    if (program === undefined) {
        throw new Error('Program not found!')
    }

    // Start at program
    let start = ApplicationState.actions[programId]
    let proxyAction = ApplicationState.actions[proxy.actionID]

    if (proxyAction.isSpatial) {
        mapping.element.appendChild(proxy.container)
        return
    }

    // Find path to proxy
    let executionPath = getAbstractionPath(start.execution as ExecutionGraph, proxyAction.execution) as (
        | ExecutionGraph
        | ExecutionNode
    )[]

    if (executionPath == null) {
        throw new Error('Could not find parent for action.')
    }

    // Find most recent parent that exists in the mapping
    let prev = start

    for (let i = 1; i < executionPath.length; i++) {
        let next = Object.values(prev.vertices).find(
            (id) => ApplicationState.actions[id].execution.id === executionPath[i].id
        )

        if (next === undefined) {
            break
        }

        prev = ApplicationState.actions[next]
    }

    // Add proxy to vessel, TODO: use path to abstract
    prev.proxy.element.appendChild(proxy.container)
}
