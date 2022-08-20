import * as monaco from 'monaco-editor'
import { ApplicationState } from '../../../ApplicationState'
import { ExecutionGraph } from '../../../execution/graph/ExecutionGraph'
import { createElement } from '../../../utilities/dom'
import { ActionState } from '../Action'
import { ActionProxyState } from '../Mapping/ActionProxy'
import { Representation } from './Representation'

export class BinaryStatementRepresentation extends Representation {
    operatorLabelElement: HTMLElement

    constructor(action: ActionState) {
        super(action)

        this.operatorLabelElement = createElement('div', [
            'action-proxy-code-label',
            'action-proxy-binary-label',
        ])
        const evaluation = (action.execution as ExecutionGraph).vertices[2]

        if (evaluation.nodeData.location == null) {
            throw new Error(
                'Binary expression evaluation has no associated location.'
            )
        }

        const evaluationText = ApplicationState.editor
            .getValueAt(evaluation.nodeData.location)
            ?.trim()

        if (evaluationText == null) {
            throw new Error('Binary expression evaluation has no text.')
        }

        this.operatorLabelElement.innerText = evaluationText
        monaco.editor
            .colorize(this.operatorLabelElement.innerHTML, 'javascript', {})
            .then((html) => {
                this.operatorLabelElement.innerHTML = html
            })
    }

    updateProxyVisual(proxy: ActionProxyState) {
        super.updateProxyVisual(proxy)

        const action = ApplicationState.actions[proxy.actionID]
        if (!action.isShowingSteps) return

        if (this.operatorLabelElement.parentElement == null) {
            const [leftElement, rightElement, operatorElement] = Array.from(
                proxy.element.children
            ).filter((child) => child.classList.contains('action-proxy'))

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
    }
}
