import * as monaco from 'monaco-editor'
import { ApplicationState } from '../../../ApplicationState'
import { createElement } from '../../../utilities/dom'
import { ActionState } from '../Action'
import { ActionProxyState } from '../Mapping/ActionProxy'
import { Representation } from './Representation'

export class ReturnStatementRepresentation extends Representation {
    returnLabelElement: HTMLElement

    constructor(action: ActionState) {
        super(action)

        this.returnLabelElement = createElement('div', [
            'action-proxy-code-label',
            'action-proxy-return-label',
        ])
        this.returnLabelElement.innerText = 'return'
        monaco.editor
            .colorize(this.returnLabelElement.innerHTML, 'javascript', {})
            .then((html) => {
                this.returnLabelElement.innerHTML = html
            })

        setTimeout(() => {
            this.createSteps(action)
        })
    }

    updateProxyVisual(proxy: ActionProxyState) {
        super.updateProxyVisual(proxy)

        const action = ApplicationState.actions[proxy.actionID]
        if (!action.isShowingSteps) return

        if (this.returnLabelElement.parentElement == null) {
            const children = Array.from(proxy.element.children).filter(
                (child) => child.classList.contains('action-proxy')
            )

            // Remove all action-proxy children
            for (const child of children) {
                child.remove()
            }

            // Add return label
            proxy.element.appendChild(this.returnLabelElement)

            // Add children
            for (const child of children) {
                proxy.element.appendChild(child)
            }
        }
    }
}
