import * as monaco from 'monaco-editor'
import { ApplicationState } from '../../../ApplicationState'
import { createElement } from '../../../utilities/dom'
import { Keyboard } from '../../../utilities/Keyboard'
import { AbyssKind, collapseForIterationIntoAbyss, createAbyss, destroyAbyss, updateForLoopAbyss } from '../Abyss'
import { ActionState } from '../Action'
import { Representation } from './Representation'

export class ForStatementRepresentation extends Representation {
    forLabelElement: HTMLElement

    iterationElements: HTMLElement[] = []

    // iterationStartTimes: number[] = []
    // iterationEndTimes: number[] = []

    pinnedIterations: Set<number> = new Set()

    showAllButton: HTMLElement
    showingAll: boolean = false

    constructor(action: ActionState) {
        super(action)

        this.forLabelElement = createElement('div', ['action-proxy-code-label', 'action-proxy-for-label'])
        this.forLabelElement.innerText = 'for'
        monaco.editor.colorize(this.forLabelElement.innerHTML, 'javascript', {}).then((html) => {
            this.forLabelElement.innerHTML = html
            action.proxy.container.classList.add('is-for-loop')
            action.proxy.header.after(this.forLabelElement)
        })

        this.showAllButton = createElement('div', ['action-proxy-for-button', 'action-proxy-show-all-button'])
        this.showAllButton.innerText = '+'
        this.showAllButton.addEventListener('click', (e) => {
            this.showAll()
            e.stopPropagation()
            e.preventDefault()
        })
        this.showAllButton.setAttribute('title', 'Toggle iterations')

        this.shouldHover = true
        this.isSelectableGroup = true
    }

    showAll() {
        const action = ApplicationState.actions[this.actionId]

        if (this.showingAll) {
            updateForLoopAbyss(this.actionId, 0, true)
            this.showAllButton.innerText = '+'

            this.showingAll = false
        } else {
            for (const abyssId of action.abyssesIds) {
                const abyss = ApplicationState.abysses[abyssId]
                if (abyss.kind == AbyssKind.ForLoop) {
                    destroyAbyss(abyssId)
                }
            }
            this.showingAll = true
            this.showAllButton.innerText = '-'
        }
    }

    // getControlFlowPointsForIteration(iteration: number, i: number): [number[], number[]] {
    //     const iterationElement = this.iterationElements[iteration]
    //     let bbox = iterationElement.getBoundingClientRect()

    //     if (iterationElement.classList.contains('consumed')) {
    //         // Find the abyss that it's in
    //         const container = ApplicationState.actions[this.actionId]

    //         for (const abyssId of container.abyssesIds) {
    //             const abyss = ApplicationState.abysses[abyssId]
    //             if (abyss.startIndex <= i && abyss.startIndex + abyss.numItems >= i) {
    //                 return getAbyssControlFlowPoints(abyss, i)
    //             }
    //         }

    //         console.log("Couldn't find abyss for iteration", iteration)
    //     }

    //     return [
    //         [bbox.x + bbox.width / 2, bbox.y],
    //         [bbox.x + bbox.width / 2, bbox.y + bbox.height],
    //     ]
    // }

    // updateControlFlow(controlFlow: ControlFlowState, originId: string) {
    //     const action = ApplicationState.actions[this.actionId]

    //     if (action.vertices.length > 0 && (!action.isSpatial || action.id == originId)) {
    //         let starts: number[] = []
    //         let ends: number[] = []

    //         for (let s = 0; s < action.vertices.length; s++) {
    //             const stepID = action.vertices[s]
    //             const step = ApplicationState.actions[stepID]

    //             if (s == 0 || (s > 1 && step.execution.nodeData.preLabel == 'Test')) {
    //                 const iteration = Math.floor(Math.max(0, (s - 1) / 3))

    //                 let [start, _] = this.getControlFlowPointsForIteration(iteration, s) as [number[], number[]]
    //                 const containerBbox = (controlFlow.flowPath.parentElement as HTMLElement).getBoundingClientRect()

    //                 start[0] -= containerBbox.x
    //                 start[1] -= containerBbox.y

    //                 let d = controlFlow.flowPath.getAttribute('d') as string

    //                 if (controlFlow.flowPath.getAttribute('d') == '') {
    //                     d += `M ${start[0]} ${start[1]}`
    //                 } else {
    //                     d += ` L ${start[0]} ${start[1]}`
    //                 }

    //                 controlFlow.flowPath.setAttribute('d', d)
    //                 this.iterationStartTimes[iteration] = controlFlow.flowPath.getTotalLength()
    //                 starts.push(this.iterationStartTimes[iteration])
    //             }

    //             // Add start point to path
    //             step.representation.updateControlFlow(controlFlow, originId)

    //             if (step.execution.nodeData.preLabel == 'Update') {
    //                 const iteration = Math.floor(Math.max(0, (s - 1) / 3))

    //                 let [_, end] = this.getControlFlowPointsForIteration(iteration, s) as [number[], number[]]
    //                 const containerBbox = (controlFlow.flowPath.parentElement as HTMLElement).getBoundingClientRect()

    //                 end[0] -= containerBbox.x
    //                 end[1] -= containerBbox.y

    //                 let d = controlFlow.flowPath.getAttribute('d') as string
    //                 d += ` L ${end[0]} ${end[1]}`

    //                 controlFlow.flowPath.setAttribute('d', d)
    //                 this.iterationEndTimes[iteration] = controlFlow.flowPath.getTotalLength()
    //                 ends.push(this.iterationEndTimes[iteration])
    //             }

    //             starts.push(step.startTime)
    //             ends.push(step.endTime)
    //         }

    //         // End for selectable groups
    //         if (action.representation.isSelectableGroup) {
    //             let [_, end] = this.getControlFlowPoints(false) as [number[], number[]]
    //             const containerBbox = (controlFlow.flowPath.parentElement as HTMLElement).getBoundingClientRect()
    //             end[0] -= containerBbox.x
    //             end[1] -= containerBbox.y

    //             let d = controlFlow.flowPath.getAttribute('d') as string
    //             d += ` L ${end[0]} ${end[1]}`

    //             controlFlow.flowPath.setAttribute('d', d)
    //             action.endTime = controlFlow.flowPath.getTotalLength()
    //             ends.push(action.endTime)
    //         }

    //         starts = starts.filter((s) => s != null)
    //         ends = ends.filter((s) => s != null)

    //         if (starts.length > 0 && ends.length > 0) {
    //             action.startTime = starts[0]
    //             action.endTime = ends[ends.length - 1]
    //         }
    //     }
    // }

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

        // Focus on the first iteration
        // const focus = ApplicationState.visualization.focus
        // clearExistingFocus()

        this.shouldHover = false

        this.setupHoverEventsForIterations()
        this.setupClickListenerForIterations()

        this.forLabelElement.append(this.showAllButton)
    }

    select() {
        super.select()

        const action = ApplicationState.actions[this.actionId]
        action.proxy.container.classList.add('is-focused')
        action.proxy.element.classList.remove('is-focused')
    }

    deselect() {
        super.deselect()

        const action = ApplicationState.actions[this.actionId]
        action.proxy.container.classList.remove('is-focused')
    }

    consumeIteration(iteration: number) {
        this.iterationElements[iteration].classList.add('consumed')
    }

    unConsumeIteration(iteration: number) {
        this.iterationElements[iteration].classList.remove('consumed')
    }

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
            let success = this.clicked(e)

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

        this.shouldHover = true

        this.iterationElements.forEach((iterationElement) => iterationElement.remove())
        this.iterationElements = []

        this.showAllButton.remove()
    }

    destroy(): void {
        super.destroy()
        this.showAllButton.remove()
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
