import * as monaco from 'monaco-editor'
import { ApplicationState } from '../../../ApplicationState'
import { createElement } from '../../../utilities/dom'
import { Keyboard } from '../../../utilities/Keyboard'
import { clearExistingFocus } from '../../../visualization/Focus'
import { AbyssKind, collapseForIterationIntoAbyss, createAbyss, focusIteration } from '../Abyss'
import { ActionState } from '../Action'
import { Representation } from './Representation'

export class ForStatementRepresentation extends Representation {
    forLabelElement: HTMLElement
    iterationElements: HTMLElement[] = []

    pinnedIterations: Set<number> = new Set()

    constructor(action: ActionState) {
        super(action)

        this.forLabelElement = createElement('div', ['action-proxy-code-label', 'action-proxy-for-label'])
        this.forLabelElement.innerText = 'for'
        monaco.editor.colorize(this.forLabelElement.innerHTML, 'javascript', {}).then((html) => {
            this.forLabelElement.innerHTML = html
            action.proxy.container.classList.add('is-for-loop')
            action.proxy.header.after(this.forLabelElement)
        })

        this.shouldHover = true
    }

    createSteps() {
        super.createSteps()

        const action = ApplicationState.actions[this.actionId]
        const proxy = action.proxy

        const children = Array.from(proxy.element.children).filter((child) =>
            child.classList.contains('action-proxy-container')
        )

        // Remove all action-proxy children
        for (const child of children) {
            child.remove()
        }

        // Add the for label
        // proxy.element.appendChild(this.forLabelElement)

        const iterations = (children.length - 2) / 3
        const iterationElements = []
        iterationElements.push(createLoopIterationElement())

        // Add initial declaration
        iterationElements[0].children[0].append(children[0])

        const startClone = children[0].cloneNode(true) as HTMLElement
        startClone.classList.add('action-proxy-for-start-clone')

        for (let i = 0; i < iterations; i++) {
            if (i != 0) {
                iterationElements[i].children[0].append(startClone.cloneNode(true))
            }

            iterationElements[i].children[0].append(children[i * 3 + 1]) // Check
            iterationElements[i].children[1].append(children[i * 3 + 2]) // Body
            iterationElements[i].children[0].append(children[i * 3 + 3]) // Update

            iterationElements.push(createLoopIterationElement())
        }

        // Add final check (failed)
        iterationElements[iterations].children[0].append(startClone.cloneNode(true))
        iterationElements[iterations].children[0].append(children[children.length - 1])

        // Add iteration elements to proxy
        for (const iterationElement of iterationElements) {
            proxy.element.append(iterationElement)
        }

        this.iterationElements = iterationElements

        const abyss = createAbyss({
            containerActionId: this.actionId,
            startIndex: 4,
            numItems: (iterations - 1) * 3,
            kind: AbyssKind.ForLoop,
        })
        action.abyssesIds.push(abyss.id)

        // for (let k = 1; k < iterations; k++) {
        // consumeForIterationToAbyss(action.id, 1)
        // }

        // Focus on the first iteration
        const focus = ApplicationState.visualization.focus
        clearExistingFocus()

        focus?.focusedActions.push([action.vertices[0], action.vertices[1], action.vertices[2], action.vertices[3]])
        iterationElements[0].classList.add('is-focused')

        this.setupHoverEventsForIterations()
        this.setupClickListenerForIterations()
    }

    select() {
        const action = ApplicationState.actions[this.actionId]
        action.proxy.container.classList.add('is-focused')
    }

    deselect() {
        const action = ApplicationState.actions[this.actionId]
        action.proxy.container.classList.remove('is-focused')
    }

    // focus() {
    //     const action = ApplicationState.actions[this.actionId]
    //     action.proxy.container.classList.add('is-focused')

    //     const focus = ApplicationState.visualization.focus
    //     assert(focus != null, 'Focus is null')

    //     clearExistingFocus()

    //     focus.focusedActions.push(action.id)

    //     // Update time
    //     const spatialId = action.spatialParentID
    //     assert(spatialId != null, 'Spatial parent ID is null')

    //     const spatial = ApplicationState.actions[spatialId]
    //     const [startTime, endTime] = this.getStartAndEndTime()
    //     spatial.representation.seekTime(endTime)
    // }

    setupHoverEventsForIterations() {
        for (const element of this.iterationElements) {
            element.addEventListener('mouseenter', (e) => {
                element.classList.add('is-hovering')

                e.preventDefault()
                e.stopPropagation()
            })

            element.addEventListener('mouseleave', (e) => {
                element.classList.remove('is-hovering')

                e.preventDefault()
                e.stopPropagation()
            })
        }
    }

    clickedIteration(iter: number) {
        // const action = ApplicationState.actions[this.actionId]

        const isHovering = this.iterationElements[iter].classList.contains('is-hovering')

        if (Keyboard.instance.isPressed('Alt')) {
            // Grouper
            if (isHovering) {
                collapseForIterationIntoAbyss(this.actionId, iter)
                return true
            }
        } else if (Keyboard.instance.isPressed('Control')) {
            // action.representation.toggleSteps()
            // TODO
        } else if (isHovering) {
            // Pointer
            const isIterationFocused = this.iterationElements[iter].classList.contains('is-focused')
            clearExistingFocus()
            if (!isIterationFocused) {
                focusIteration(this.actionId, iter)
            }
            return true
        }

        return false
    }

    setupClickListenerForIterations() {
        for (let i = 0; i < this.iterationElements.length; i++) {
            const element = this.iterationElements[i]

            element.addEventListener('click', (e) => {
                const success = this.clickedIteration(i)

                if (success) {
                    e.preventDefault()
                    e.stopPropagation()
                }
            })
        }
    }

    setupHoverListener() {
        const action = ApplicationState.actions[this.actionId]

        // Hovers on container instead of element.
        action.proxy.container.addEventListener('mouseenter', (e) => {
            const action = ApplicationState.actions[this.actionId]

            if (action.representation.shouldHover) {
                action.proxy.isHovering = true
                action.proxy.container.classList.add('is-hovering')
            }

            e.preventDefault()
            e.stopPropagation()
        })

        action.proxy.container.addEventListener('mouseleave', (e) => {
            const action = ApplicationState.actions[this.actionId]

            if (action.proxy.isHovering) {
                action.proxy.isHovering = false
                action.proxy.container.classList.remove('is-hovering')
            }

            e.preventDefault()
            e.stopPropagation()
        })
    }

    setupClickListener() {
        const action = ApplicationState.actions[this.actionId]

        action.proxy.container.addEventListener('click', (e) => {
            let success = this.clicked()

            if (success) {
                e.preventDefault()
                e.stopPropagation()
            }
        })
    }

    destroySteps(): void {
        super.destroySteps()

        // Destroy abysses
        // TODO

        this.iterationElements.forEach((iterationElement) => iterationElement.remove())
        this.iterationElements = []
    }
}

function createLoopIterationElement() {
    const el = createElement('div', 'action-proxy-for-iteration')
    el.innerHTML = `<div class="action-proxy-for-iteration-top"></div> <div class="action-proxy-for-iteration-bottom"></div>`

    return el
}

// export function focusOnIteration() {
//     const action = ApplicationState.actions[ApplicationState.selectedActionId]
//     const proxy = action.proxy
//     const children = Array.from(proxy.element.children).filter((child) =>
//         child.classList.contains('action-proxy-container')
//     )
//     const iteration = children.length / 3
//     const iterationElement = action.representation.iterationElements[iteration]
//     iterationElement.focus()
// }
