import { Ticker } from '../utilities/Ticker'

export type FocusState = {
    focusedActions: (string | string[])[]

    // Tick id
    tickID: string
}

export function createFocus(overrides: Partial<FocusState> = {}): FocusState {
    // const element = createElement('div', 'focus', document.body)

    const base: FocusState = {
        focusedActions: [],
        tickID: Ticker.instance.registerTick(() => {
            updateFocus()
        }),
    }

    return { ...base, ...overrides }
}

export function destroyFocus(focus: FocusState) {
    // focus.element.remove()
}

// export function clearExistingFocus() {
//     const focus = ApplicationState.visualization.focus
//     assert(focus != undefined, 'Focus is undefined')

//     if (Keyboard.instance.isPressed('Shift')) {
//         return
//     }

//     for (let i = focus.focusedActions.length - 1; i >= 0; i--) {
//         const otherId = focus.focusedActions[i]

//         if (Array.isArray(otherId)) {
//             const forLoopId = ApplicationState.actions[otherId[0]].parentID as string
//             const forLoop = ApplicationState.actions[forLoopId]

//             const iterationIndex = Math.floor(Math.max(0, forLoop.vertices.indexOf(otherId[0]) - 1) / 3)
//             const representation = forLoop.representation as ForStatementRepresentation

//             if (!representation.pinnedIterations.has(iterationIndex)) {
//                 // Remove iteration from focus
//                 focus.focusedActions.splice(focus.focusedActions.indexOf(otherId), 1)
//                 representation.pinnedIterations.delete(iterationIndex)
//                 representation.iterationElements[iterationIndex].classList.remove('is-focused')
//             }
//         } else {
//             const other = ApplicationState.actions[otherId]
//             if (!other.isPinned) {
//                 other.proxy.container.classList.remove('is-focused')
//                 other.proxy.element.classList.remove('is-focused')

//                 focus.focusedActions.splice(i, 1)
//             }
//         }
//     }
// }

export function updateFocus() {
    // const focus = ApplicationState.visualization.focus
    // assert(focus != undefined, 'Focus is undefined.')
    // if (focus.focusedActions.length == 0) {
    //     focus.element.classList.add('is-hidden')
    // } else {
    //     focus.element.classList.remove('is-hidden')
    //     const element = ApplicationState.actions[focus.focusedActions[0]].proxy.element
    //     if (element == undefined) {
    //         throw new Error('Focus element is undefined.')
    //     }
    //     // Set position
    //     const bbox = element.getBoundingClientRect()
    //     focus.element.style.left = `${bbox.left}px`
    //     focus.element.style.top = `${bbox.top}px`
    //     focus.element.style.width = `${bbox.width}px`
    //     focus.element.style.height = `${bbox.height}px`
    // }
    // Scale down all elements that are not focused
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
