import { ApplicationState } from '../../../ApplicationState'
import { ExecutionGraph } from '../../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../../execution/primitive/ExecutionNode'
import { getAbstractionPath } from '../../../utilities/action'
import { createElement } from '../../../utilities/dom'
import { clone } from '../../../utilities/objects'
import { ActionProxyState } from './ActionProxy'
import {
    ControlFlowState,
    createControlFlowState,
    destroyControlFlow,
} from './ControlFlow'

/* ------------------------------------------------------ */
/*               Stores mapping information               */
/* ------------------------------------------------------ */
export interface ActionMappingState {
    element: HTMLElement
    frames: HTMLElement[]

    // Break indices (occurs between actions[index] and actions[index + 1])
    breaks: number[]
    breakElements: HTMLElement[]

    // Control flow
    controlFlow: ControlFlowState | undefined

    // Program
    program: ActionProxyState | undefined

    time: number
}

/**
 * Creates an action mapping.
 * @param overrides
 * @returns
 */
export function createActionMapping(
    overrides: Partial<ActionMappingState> = {}
): ActionMappingState {
    const base: ActionMappingState = {
        element: createElement('div', 'action-mapping'),
        frames: [],

        // Break indices (occurs between actions[index] and actions[index + 1])
        breaks: [],
        breakElements: [],

        // Control flow
        controlFlow: createControlFlowState(),
        // cursor: createActionMappingCursorState(),

        // Program
        program: undefined,

        time: 0,
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
    actionMapping.program = undefined
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
export function getBreakIndexOfFrameIndex(
    mapping: ActionMappingState,
    index: number
): number {
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

    const breakEl = createElement(
        'div',
        'action-mapping-break',
        mapping.element.parentElement as HTMLElement
    )
    mapping.breakElements.push(breakEl)
}

/**
 * Adds the proxy element to the mapping.
 * @param proxy Action proxy
 * @param mapping Action mapping
 */
export function appendProxyToMapping(
    proxy: ActionProxyState,
    mapping: ActionMappingState
) {
    if (
        ApplicationState.actions[proxy.actionID].execution.nodeData.type ===
        'Program'
    ) {
        mapping.program = proxy
        mapping.element.appendChild(proxy.element)
        return
    }

    if (mapping.program === undefined) {
        throw new Error('Program not found!')
    }

    // Start at program
    let start = ApplicationState.actions[mapping.program.actionID]
    let proxyAction = ApplicationState.actions[proxy.actionID]

    // Find path to proxy
    let executionPath = getAbstractionPath(
        start.execution as ExecutionGraph,
        proxyAction.execution
    ) as (ExecutionGraph | ExecutionNode)[]

    if (executionPath == null) {
        throw new Error('Could not find parent for action.')
    }

    // Find most recent parent that exists in the mapping
    let prev = start

    for (let i = 1; i < executionPath.length; i++) {
        let next = Object.values(prev.vertices).find(
            (id) =>
                ApplicationState.actions[id].execution.id ===
                executionPath[i].id
        )

        if (next === undefined) {
            console.log('Broke at', clone(prev), ' -> ', executionPath[i].id)
            break
        }

        prev = ApplicationState.actions[next]
    }

    console.log(prev)

    // Add proxy to vessel, TODO: use path to abstract
    if (proxyAction.isSpatial) {
        mapping.element.appendChild(proxy.element)
    } else {
        prev.proxy.element.appendChild(proxy.element)
    }
}

export function isHardExecution(execution: ExecutionGraph | ExecutionNode) {
    return (
        execution.nodeData.type === 'FunctionCall' ||
        execution.nodeData.type === 'Program'
    )
}
