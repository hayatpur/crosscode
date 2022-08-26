import { ApplicationState } from '../../../ApplicationState'
import { ExecutionGraph } from '../../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../../execution/primitive/ExecutionNode'
import { getAccumulatedBoundingBox } from '../../../utilities/action'
import { createElement } from '../../../utilities/dom'

export type ActionProxyState = {
    // Container of this things indicator and its steps
    container: HTMLElement
    header: HTMLElement
    controls: HTMLElement | null
    element: HTMLElement

    // Corresponding action
    actionID: string

    // Time in control flow
    timeOffset: number

    isHovering: boolean
}

/**
 * Creates an executor.
 * @param overrides
 * @returns
 */
export function createActionProxy(overrides: Partial<ActionProxyState> = {}): ActionProxyState {
    if (overrides.actionID === undefined) {
        throw new Error('ActionProxy requires an action')
    }

    const action = ApplicationState.actions[overrides.actionID]

    // Container for the action and its label
    const container = createElement('div', 'action-proxy-container')

    // Header for the action
    const header = createElement('div', 'action-proxy-header', container)

    // Label
    const label = createElement('div', 'action-proxy-label', header)
    label.innerText = `${action.execution.nodeData.type}`

    const element = createElement(
        'div',
        [
            'action-proxy',
            `type-${action.execution.nodeData.type?.replace(' ', '-')}`,
            `pre-label-${action.execution.nodeData.preLabel?.replace(' ', '-')}`,
        ],
        container
    )

    const base: ActionProxyState = {
        element: element,
        header: header,
        controls: null,
        container: container,
        actionID: overrides.actionID,
        timeOffset: 0,
        isHovering: false,
    }

    // Event listeners
    setupEventListeners(base)

    return { ...base, ...overrides }
}

export function destroyActionProxy(proxy: ActionProxyState) {
    proxy.container.remove()
}

export function setupEventListeners(proxy: ActionProxyState) {
    proxy.element.addEventListener('click', (e) => {
        const action = ApplicationState.actions[proxy.actionID]

        if (action.isSpatial && !(action.execution.nodeData.type == 'Program') && action.isShowingSteps) {
            e.preventDefault()
            e.stopPropagation()
            return
        }

        if (action.isShowingSteps) {
            action.representation.destroySteps()
        } else {
            action.representation.createSteps()
        }

        e.preventDefault()
        e.stopPropagation()
    })
}

export function isSpatialByDefault(execution: ExecutionGraph | ExecutionNode) {
    return execution.nodeData.type == 'FunctionCall' || execution.nodeData.type == 'Program'
}

export function clipActionProxy(actionID: string) {
    const action = ApplicationState.actions[actionID]

    if (action.spatialVertices.size > 0) {
        const bbox = getAccumulatedBoundingBox(
            [...action.spatialVertices].map((v) => ApplicationState.actions[v].parentID as string)
        )
        const actionBbox = action.proxy.element.getBoundingClientRect()
        let { y, height } = bbox

        y = y - actionBbox.y

        // action.proxy.element.style.margin
        const firstChild = action.proxy.element.children[0] as HTMLElement

        firstChild.style.marginTop = `${-y}px`
        action.proxy.element.style.maxHeight = `${height}px`

        action.proxy.element.classList.add('clipped')
    } else {
        // Get what things are not going to be clipped by default
        throw new Error('No implementation for clipping')
    }
}

export function unClipActionProxy(actionID: string) {
    // TODO
}
