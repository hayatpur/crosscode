import { ExecutionGraph } from '../../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../../execution/primitive/ExecutionNode'
import { Executor } from '../../../executor/Executor'
import { getAbstractionPath } from '../../../utilities/action'
import { createElement } from '../../../utilities/dom'
import { Action } from '../Action'
import { ActionMappingCursor } from './ActionMappingCursor'
import { ActionProxy } from './ActionProxy'
import { ControlFlow } from './ControlFlow'
import { Vessel } from './Vessel'

export class ActionMapping {
    element: HTMLElement

    frames: HTMLElement[] = []

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

    vessel: Vessel

    constructor() {
        // Early binding
        Executor.instance.visualization.mapping = this

        // Create element
        this.element = createElement('div', 'action-mapping')
        const container = Executor.instance.visualization.container
        container.insertBefore(this.element, container.firstChild)

        // Initial vessel
        this.vessel = new Vessel(Executor.instance.visualization.program.execution)
        this.element.appendChild(this.vessel.element)

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

        this.vessel.destroy()

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
            appendProxyToMapping(mapping.actionProxies[step.execution.id], mapping)
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
    // Find appropriate vessel
    let vessel = mapping.vessel
    let executionPath = getAbstractionPath(vessel.execution as ExecutionGraph, proxy.action.execution) as (
        | ExecutionGraph
        | ExecutionNode
    )[]

    if (executionPath == null) {
        console.error('Could not find vessel for action', proxy.action)
        return
    }

    // Find potential vessels
    let intermediatePath = []
    for (let i = 0; i < executionPath.length; i++) {
        if (isVesselExecution(executionPath[i])) {
            let next = vessel.vertices.find((v) => v.execution.id === executionPath[i].id)

            // Create vessel if it doesn't exist
            if (next == null) {
                next = new Vessel(executionPath[i])
                mapping.element.appendChild(next.element)

                vessel.addVertex(next, { path: intermediatePath })
            }

            vessel = next
        } else {
            intermediatePath.push(executionPath[i])
        }
    }

    // Add proxy to vessel, TODO: use path to abstract
    vessel.addProxy(proxy)

    // Add to that vessel
    // mapping.vessel.addProxy(proxy)
}

export function isVesselExecution(execution: ExecutionGraph | ExecutionNode) {
    return execution.nodeData.type === 'FunctionCall'
}
