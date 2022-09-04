import { ApplicationState } from '../../../ApplicationState'
import { ExecutionGraph } from '../../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../../execution/primitive/ExecutionNode'
import { getAbstractionPath } from '../../../utilities/action'
import { createElement, createSVGElement } from '../../../utilities/dom'
import { assert } from '../../../utilities/generic'
import { Keyboard } from '../../../utilities/Keyboard'
import { ActionProxyState } from './ActionProxy'

/* ------------------------------------------------------ */
/*               Stores mapping information               */
/* ------------------------------------------------------ */
export type ActionMappingState = {
    element: HTMLElement
    frames: HTMLElement[]

    // Break indices (occurs between actions[index] and actions[index + 1])
    breaks: number[]
    breakElements: HTMLElement[]

    // SVG Canvas
    svgElement: SVGElement

    indicationElement: HTMLElement
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

        indicationElement: createIndicationElement(element),

        svgElement: svgElement,
    }

    return { ...base, ...overrides }
}

export function createIndicationElement(parent: HTMLElement) {
    const container = createElement('div', ['mode-indicator-container'])

    const selector = createElement('div', ['mode-indicator', 'pointer'], container)
    selector.innerText = 'Select (Shift)'

    const destructor = createElement('div', ['mode-indicator', 'destructor'], container)
    destructor.innerText = 'Destruct (Control)'

    const abyss = createElement('div', ['mode-indicator', 'abyss'], container)
    abyss.innerText = 'Abyss (Alt)'

    setInterval(() => {
        if (Keyboard.instance.isPressed('Control')) {
            destructor.classList.add('active')

            abyss.classList.remove('active')
            selector.classList.remove('active')
        } else if (Keyboard.instance.isPressed('Shift')) {
            selector.classList.add('active')

            destructor.classList.remove('active')
            abyss.classList.remove('active')
        } else if (Keyboard.instance.isPressed('Alt')) {
            abyss.classList.add('active')

            destructor.classList.remove('active')
            selector.classList.remove('active')
        } else {
            selector.classList.remove('active')
            destructor.classList.remove('active')
            abyss.classList.remove('active')
        }
    }, 100)

    parent.appendChild(container)

    return container
}

export function destroyActionMapping(actionMapping: ActionMappingState) {
    actionMapping.element.remove()

    actionMapping.breakElements.forEach((breakEl) => {
        breakEl.remove()
    })

    actionMapping.breakElements = []
    actionMapping.breaks = []
    actionMapping.frames = []
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
    const proxyAction = ApplicationState.actions[proxy.actionID]

    if (proxyAction.execution.nodeData.type === 'Program') {
        mapping.element.appendChild(proxy.container)
        // proxyAction.representation.focus()
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
