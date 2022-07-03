import { Executor } from '../../../executor/Executor'
import { createElement } from '../../../utilities/dom'
import { Action } from '../Action'
import { ActionMappingCursor } from './ActionMappingCursor'
import { ActionProxy } from './ActionProxy'
import { ControlFlow } from './ControlFlow'

export class ActionMapping {
    element: HTMLElement

    // Action proxies
    actionProxies: { [id: string]: ActionProxy } = {}

    // Break indices (occurs between actions[index] and actions[index + 1])
    // TODO: More generalizable layout
    breaks: number[] = []
    breakElements: HTMLElement[] = []

    // Control flow
    controlFlow!: ControlFlow
    time: number = 0

    cursor!: ActionMappingCursor

    constructor() {
        // Early binding
        Executor.instance.visualization.mapping = this

        // Create element
        this.element = createElement('div', 'action-mapping')
        const container = Executor.instance.visualization.container
        container.insertBefore(this.element, container.firstChild)

        // Create cursor
        setTimeout(() => {
            this.controlFlow = new ControlFlow(this)
            this.cursor = new ActionMappingCursor(this)

            // Update frames
            Executor.instance.visualization.program.update()
        }, 0)

        // Update proxies
        updateMappingProxies(this)
    }

    destroy() {
        this.element.remove()

        for (const proxy of Object.values(this.actionProxies)) {
            proxy.destroy()
        }

        this.breakElements.forEach((breakEl) => {
            breakEl.remove()
        })

        this.controlFlow.destroy()
        this.cursor.destroy()
    }
}

/**
 * Updates action proxies inside the mapping.
 * @param mapping
 */
export function updateMappingProxies(mapping: ActionMapping) {
    const hits: Set<string> = new Set() // Keep track of hit proxies to discard them later

    // Update proxies
    for (const step of Executor.instance.visualization.program.steps) {
        if (mapping.actionProxies[step.execution.id] == null) {
            mapping.actionProxies[step.execution.id] = new ActionProxy(step)
            mapping.element.append(mapping.actionProxies[step.execution.id].element)
        }

        mapping.actionProxies[step.execution.id].update()
        hits.add(step.execution.id)
    }

    // Discard unused proxies
    for (const stepId of Object.keys(mapping.actionProxies)) {
        if (!hits.has(stepId)) {
            mapping.actionProxies[stepId].element.remove()
            delete mapping.actionProxies[stepId]
        }
    }

    // Update control flow
    mapping.controlFlow?.update()
}

/**
 * Updates action proxies inside the mapping.
 * @param mapping
 * @param index
 */
export function getBreakIndexOfFrameIndex(mapping: ActionMapping, index: number): number {
    for (let i = 0; i < mapping.breaks.length; i++) {
        if (mapping.breaks[i] >= index) {
            return i
        }
    }
    return mapping.breaks.length
}

/**
 * @param action
 * @returns proxy for the given action.
 */
export function getProxyOfAction(action: Action) {
    return ActionProxy.all[action.state.id]
}

/**
 * @param mapping Action mapping
 * @param index Index of the frame
 */
export function addBreakToMapping(mapping: ActionMapping, index: number) {
    mapping.breaks.push(index)

    const breakEl = createElement('div', 'action-mapping-break', mapping.element.parentElement as HTMLElement)
    mapping.breakElements.push(breakEl)
}

/**
 * Adds the proxy element to the mapping.
 * @param proxy Action proxy
 * @param mapping Action mapping
 */
export function appendProxyToMapping(proxy: ActionProxy, mapping: ActionMapping) {
    mapping.element.appendChild(proxy.element)
}
