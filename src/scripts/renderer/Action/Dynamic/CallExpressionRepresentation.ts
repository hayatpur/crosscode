import * as monaco from 'monaco-editor'
import { ApplicationState } from '../../../ApplicationState'
import { createElement } from '../../../utilities/dom'
import { ActionState } from '../Action'
import { Representation } from './Representation'

export class CallExpressionRepresentation extends Representation {
    hasAppliedProxyVisual: boolean = false
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

        const action = ApplicationState.actions[this.actionId]
        const proxy = action.proxy

        if (!action.isShowingSteps || this.hasAppliedProxyVisual) return

        const [argElement, bodyElement] = Array.from(proxy.element.children).filter(
            (child) =>
                child.classList.contains('action-proxy-container') ||
                child.classList.contains('action-proxy-placeholder')
        )

        console.log(argElement, bodyElement)

        // Remove all action-proxy children
        argElement.remove()
        bodyElement.remove()

        // if (!action.isSpatial) {
        //     throw new Error(
        //         'CallExpressionRepresentation is not implemented for non-spatial actions'
        //     )
        // }

        // action.placeholder.append(argElement)
        // action.placeholder.append(this.callExpressionLabelElement)

        action.proxy.element.append(bodyElement)

        this.hasAppliedProxyVisual = true
    }
}
