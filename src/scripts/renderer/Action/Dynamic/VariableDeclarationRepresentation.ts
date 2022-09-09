import * as monaco from 'monaco-editor'
import { ApplicationState } from '../../../ApplicationState'
import { ExecutionGraph } from '../../../execution/graph/ExecutionGraph'
import { createElement } from '../../../utilities/dom'
import { getConsumedAbyss } from '../Abyss'
import { ActionState } from '../Action'
import { Representation } from './Representation'

export class VariableDeclarationRepresentation extends Representation {
    equalSignElement: HTMLElement
    identifierElement: HTMLElement

    constructor(action: ActionState) {
        super(action)

        this.equalSignElement = createElement('div', 'action-proxy-equal-sign')
        this.equalSignElement.innerText = '='

        this.identifierElement = createElement('div', ['action-proxy-code-label', 'action-proxy-identifier-label'])
        this.identifierElement.innerText = ApplicationState.editor.getValueAt(
            (action.execution as ExecutionGraph).vertices[1].nodeData.location!
        )!

        monaco.editor.colorize(this.identifierElement.innerHTML, 'javascript', {}).then((html) => {
            this.identifierElement.innerHTML = html
        })

        this.shouldHover = true
        this.ignoreStepClicks = true
    }

    postCreate() {
        const action = ApplicationState.actions[this.actionId]

        if (action.execution.nodeData.preLabel == 'Statement') {
            this.createSteps()
        }
    }

    unConsume() {
        const action = ApplicationState.actions[this.actionId]

        super.unConsume()

        if (action.execution.nodeData.preLabel == 'Statement') {
            this.createSteps()
        }
    }

    // getStartAndEndTime() {
    //     const action = ApplicationState.actions[this.actionId]

    //     if (action.isShowingSteps) {
    //         return ApplicationState.actions[action.vertices[0]].representation.getStartAndEndTime()
    //     } else {
    //         return super.getStartAndEndTime()
    //     }
    // }

    // getControlFlow(): number[][] {
    //     const action = ApplicationState.actions[this.actionId]

    //     if (action.isShowingSteps) {
    //         return ApplicationState.actions[action.vertices[0]].representation.getControlFlow()
    //     } else {
    //         return super.getControlFlow()
    //     }

    //     // const bbox = action.proxy.element.getBoundingClientRect()

    //     // if (action.vertices.length > 0) {
    //     //     const controlFlowPoints = []
    //     //     for (const stepID of action.vertices) {
    //     //         const step = ApplicationState.actions[stepID]
    //     //         controlFlowPoints.push(...step.representation.getControlFlow())
    //     //     }
    //     //     return controlFlowPoints
    //     // } else {
    //     //     return this.getControlFlowPoints()
    //     // }
    // }

    createSteps(): void {
        super.createSteps()

        const action = ApplicationState.actions[this.actionId]
        const proxy = action.proxy

        // Insert identifier at the start
        proxy.element.insertBefore(this.identifierElement, proxy.element.children[0])

        // Add an '=' in between the two children if not already there
        proxy.element.insertBefore(this.equalSignElement, proxy.element.children[1])

        // Set the width of the identifier
        setTimeout(() => {
            this.identifierElement.style.width = `${this.identifierElement.getBoundingClientRect().width}px`
        }, 100)
    }

    destroySteps(): void {
        super.destroySteps()
        this.equalSignElement.remove()
        this.identifierElement.remove()
    }

    getControlFlowPoints(
        usePlaceholder: boolean = true,
        referencePoint: { x: number; y: number } = { x: 0, y: 0 }
    ): [number, number][] | null {
        if (this.isTrimmed) {
            return null
        }

        const action = ApplicationState.actions[this.actionId]
        const abyssInfo = getConsumedAbyss(action.id)

        if (abyssInfo != null && !action.isSpatial) {
            // Find the abyss that it's in
            return super.getControlFlowPoints(usePlaceholder)
        }

        const parent = ApplicationState.actions[action.parentID!]

        if (
            action.execution.nodeData.preLabel == 'Initial' &&
            parent.execution.nodeData.type == 'ForStatement' &&
            !action.isShowingSteps
        ) {
            let bbox = action.proxy.element.getBoundingClientRect()

            const offset = Math.min(2, bbox.height * 0.1)

            return [
                [bbox.x + bbox.width / 2, bbox.y],
                [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2],
                [bbox.x + bbox.width, bbox.y + bbox.height / 2],
            ]
        } else {
            return super.getControlFlowPoints(usePlaceholder)
        }
    }
}
