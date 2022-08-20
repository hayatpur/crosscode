import { ApplicationState } from '../../../ApplicationState'
import { createElement } from '../../../utilities/dom'
import { Keyboard } from '../../../utilities/Keyboard'
import { ActionState, makeSpatial } from '../Action'

export interface ActionProxyState {
    // Container of this things indicator and its steps
    element: HTMLElement

    // Corresponding action
    actionID: string

    // Time in control flow
    timeOffset: number

    isHovering: boolean

    label: HTMLElement
}

/**
 * Creates an executor.
 * @param overrides
 * @returns
 */
export function createActionProxy(
    overrides: Partial<ActionProxyState> = {}
): ActionProxyState {
    if (overrides.actionID === undefined) {
        throw new Error('ActionProxy requires an action')
    }

    const action = ApplicationState.actions[overrides.actionID]

    const classes = [
        'action-proxy',
        `type-${action.execution.nodeData.type?.replace(' ', '-')}`,
        `pre-label-${action.execution.nodeData.preLabel?.replace(' ', '-')}`,
    ]

    const element = createElement('div', classes)
    const label = createElement('div', 'action-proxy-label', element)
    label.innerText = `${action.execution.nodeData.type}`

    const base: ActionProxyState = {
        element: element,
        label: label,
        actionID: overrides.actionID,
        timeOffset: 0,
        isHovering: false,
    }

    // Event listeners
    setupEventListeners(base)

    // Update visual
    action.representation.updateProxyVisual(base)

    return { ...base, ...overrides }
}

export function destroyActionProxy(proxy: ActionProxyState) {
    proxy.element.remove()
}

export function setupEventListeners(proxy: ActionProxyState) {
    proxy.element.addEventListener('click', (e) => {
        const action = ApplicationState.actions[proxy.actionID]

        if (
            action.isSpatial &&
            !(action.execution.nodeData.type == 'Program') &&
            action.isShowingSteps
        ) {
            e.preventDefault()
            e.stopPropagation()
            return
        }

        if (action.isShowingSteps) {
            action.representation.destroySteps(action)
        } else {
            if (
                Keyboard.instance.isPressed('Shift') ||
                isSpatialByDefault(action)
            ) {
                makeSpatial(action)
            }

            action.representation.createSteps(action)
        }

        e.preventDefault()
        e.stopPropagation()
    })

    // Drag

    let _prevMousePosition: { x: number; y: number } = { x: 0, y: 0 }

    proxy.element.addEventListener('mousedown', (e) => {
        const action = ApplicationState.actions[proxy.actionID]
        if (
            action.isSpatial &&
            !(action.execution.nodeData.type == 'Program')
        ) {
            action.isDragging = true

            _prevMousePosition = {
                x: e.x,
                y: e.y,
            }
        }
    })

    document.addEventListener('mousemove', (e) => {
        const action = ApplicationState.actions[proxy.actionID]

        if (!action.isDragging) {
            return
        }

        const dx = e.x - _prevMousePosition.x
        const dy = e.y - _prevMousePosition.y

        action.position.x += dx
        action.position.y += dy

        action.proxy.element.style.marginLeft = `${action.position.x}px`
        action.proxy.element.style.marginTop = `${action.position.y}px`
        // action.proxy.element.style.transform = `translate(${action.position.x}px, ${action.position.y}px)`

        _prevMousePosition = {
            x: e.x,
            y: e.y,
        }
    })

    document.addEventListener('mouseup', (e) => {
        const action = ApplicationState.actions[proxy.actionID]

        if (action.isDragging) {
            action.isDragging = false
        }
    })
}

export function isSpatialByDefault(action: ActionState) {
    return action.execution.nodeData.type == 'CallExpression'
}
