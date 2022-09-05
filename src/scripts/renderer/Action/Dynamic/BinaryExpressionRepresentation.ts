import * as monaco from 'monaco-editor'
import { ApplicationState } from '../../../ApplicationState'
import { ExecutionGraph } from '../../../execution/graph/ExecutionGraph'
import { createElement } from '../../../utilities/dom'
import { getConsumedAbyss } from '../Abyss'
import { ActionState } from '../Action'
import { Representation } from './Representation'

export class BinaryStatementRepresentation extends Representation {
    operatorLabelElement: HTMLElement

    constructor(action: ActionState) {
        super(action)

        this.operatorLabelElement = createElement('div', ['action-proxy-code-label', 'action-proxy-binary-label'])
        console.log(action.execution)
        const evaluation = (action.execution as ExecutionGraph).vertices[2]

        if (evaluation.nodeData.location == null) {
            throw new Error('Binary expression evaluation has no associated location.')
        }

        const evaluationText = ApplicationState.editor.getValueAt(evaluation.nodeData.location)?.trim()

        if (evaluationText == null) {
            throw new Error('Binary expression evaluation has no text.')
        }

        this.operatorLabelElement.innerText = evaluationText
        monaco.editor.colorize(this.operatorLabelElement.innerHTML, 'javascript', {}).then((html) => {
            this.operatorLabelElement.innerHTML = html
        })

        this.shouldHover = true
    }

    createSteps(): void {
        super.createSteps()

        const action = ApplicationState.actions[this.actionId]
        const proxy = action.proxy

        if (!action.isShowingSteps) return

        const [leftElement, rightElement, operatorElement] = Array.from(proxy.element.children).filter((child) =>
            child.classList.contains('action-proxy-container')
        )

        // Remove all action-proxy children
        leftElement.remove()
        rightElement.remove()
        operatorElement.remove()

        // Add left element
        proxy.element.appendChild(leftElement)

        // Add operator label
        proxy.element.appendChild(this.operatorLabelElement)

        // Add right element
        proxy.element.appendChild(rightElement)
    }

    destroySteps(): void {
        super.destroySteps()

        this.operatorLabelElement.remove()
    }

    getControlFlowPoints(usePlaceholder: boolean = true): [number, number][] | null {
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
            action.execution.nodeData.preLabel == 'Test' &&
            parent.execution.nodeData.type == 'ForStatement' &&
            !action.isShowingSteps
        ) {
            let bbox = action.proxy.element.getBoundingClientRect()

            const offset = Math.min(2, bbox.height * 0.1)

            return [
                [bbox.x, bbox.y + bbox.height / 2],
                [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2],
                [bbox.x + bbox.width / 2, bbox.y + bbox.height],
            ]
        } else {
            return super.getControlFlowPoints(usePlaceholder)
        }
    }
}
