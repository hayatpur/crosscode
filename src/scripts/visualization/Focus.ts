import { createElement } from '../utilities/dom'
import { Ticker } from '../utilities/Ticker'

export interface FocusState {
    currentFocus: string | undefined
    focusElement: HTMLElement

    // Tick id
    tickID: string
}

export function createFocus(overrides: Partial<FocusState> = {}): FocusState {
    const element = createElement('div', 'focus')
    document.body.appendChild(element)

    const base: FocusState = {
        currentFocus: undefined,
        focusElement: element,
        tickID: Ticker.instance.registerTick(() => {
            updateFocus()
        }),
    }

    return { ...base, ...overrides }
}

export function destroyFocus(focus: FocusState) {
    focus.focusElement.remove()
}

export function updateFocus() {
    // const focus = ApplicationState.visualization.focus
    // if (focus == undefined) {
    //     throw new Error('Focus is undefined.')
    // }
    // if (focus.currentFocus === undefined) {
    //     focus.focusElement.style.display = 'none'
    // } else {
    //     focus.focusElement.style.display = 'block'
    //     // Get element
    //     const element =
    //         ApplicationState.actions[focus.currentFocus].proxy.element
    //     if (element == undefined) {
    //         throw new Error('Focus element is undefined.')
    //     }
    //     // Set position
    //     const bbox = element.getBoundingClientRect()
    //     focus.focusElement.style.left = `${bbox.left}px`
    //     focus.focusElement.style.top = `${bbox.top}px`
    //     focus.focusElement.style.width = `${bbox.width}px`
    //     focus.focusElement.style.height = `${bbox.height}px`
    // }
    // // Scale down all elements that are not focused
    // const spatialActionProxies = Object.values(ApplicationState.actions).filter(
    //     (action) =>
    //         action.isSpatial || action.execution.nodeData.type == 'Program'
    // )
    // for (const action of spatialActionProxies) {
    //     if (
    //         action.id == focus.currentFocus ||
    //         focus.currentFocus == undefined
    //     ) {
    //         if (action.proxy.element.classList.contains('out-of-focus')) {
    //             action.proxy.element.classList.remove('out-of-focus')
    //         }
    //     } else {
    //         if (!action.proxy.element.classList.contains('out-of-focus')) {
    //             action.proxy.element.classList.add('out-of-focus')
    //         }
    //     }
    // }
}
