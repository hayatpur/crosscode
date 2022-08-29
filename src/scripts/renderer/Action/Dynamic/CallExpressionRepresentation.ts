import * as monaco from 'monaco-editor'
import { ApplicationState } from '../../../ApplicationState'
import { createElement } from '../../../utilities/dom'
import { ActionState } from '../Action'
import { Representation } from './Representation'

export class CallExpressionRepresentation extends Representation {
    callExpressionLabelElement: HTMLElement

    constructor(action: ActionState) {
        super(action)

        this.callExpressionLabelElement = createElement('div', ['action-proxy-code-label'])

        if (action.execution.nodeData.location == undefined) {
            throw new Error('Call expression has no nodeData location.')
        }

        this.callExpressionLabelElement.innerText =
            ApplicationState.editor.getValueAt(action.execution.nodeData.location) ?? 'Unknown'

        monaco.editor.colorize(this.callExpressionLabelElement.innerHTML, 'javascript', {}).then((html) => {
            this.callExpressionLabelElement.innerHTML = html
        })
    }

    updateProxyVisual() {
        super.updateProxyVisual()
    }

    createSteps(): void {
        super.createSteps()

        const action = ApplicationState.actions[this.actionId]
        const proxy = action.proxy

        const [argElement, bodyElement] = Array.from(proxy.element.children).filter(
            (child) =>
                child.classList.contains('action-proxy-container') ||
                child.classList.contains('action-proxy-placeholder')
        )

        // Remove all action-proxy children
        argElement.remove()
        bodyElement.remove()

        // Add call expression label to placeholder
        // TODO

        action.proxy.element.append(bodyElement)
    }
}
