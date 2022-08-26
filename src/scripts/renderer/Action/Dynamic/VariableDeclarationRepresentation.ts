import { ApplicationState } from '../../../ApplicationState'
import { createElement } from '../../../utilities/dom'
import { ActionState } from '../Action'
import { Representation } from './Representation'

export class VariableDeclarationRepresentation extends Representation {
    equalSignElement: HTMLElement

    constructor(action: ActionState) {
        super(action)

        this.equalSignElement = createElement('div', 'action-proxy-equal-sign')
        this.equalSignElement.innerText = '='
    }

    postCreate() {
        const action = ApplicationState.actions[this.actionId]

        if (action.execution.nodeData.preLabel == 'Statement') {
            this.createSteps()
        }
    }

    updateProxyVisual() {
        super.updateProxyVisual()

        // Add an '=' in between the two children if not already there
        const action = ApplicationState.actions[this.actionId]
        const proxy = action.proxy

        if (action.isShowingSteps && this.equalSignElement.parentElement !== proxy.element) {
            proxy.element.insertBefore(this.equalSignElement, proxy.element.children[1])
        }
    }
}
