import { ApplicationState } from '../../../ApplicationState'
import { createElement } from '../../../utilities/dom'
import { ActionProxyState } from '../Mapping/ActionProxy'
import { Representation } from './Representation'

export class VariableDeclarationRepresentation extends Representation {
    equalSignElement: HTMLElement

    constructor() {
        super()

        this.equalSignElement = createElement('div', 'action-proxy-equal-sign')
        this.equalSignElement.innerText = '='
    }

    updateProxyVisual(proxy: ActionProxyState) {
        super.updateProxyVisual(proxy)

        // Add an '=' in between the two children if not already there
        const action = ApplicationState.actions[proxy.actionID]

        if (
            action.isShowingSteps &&
            this.equalSignElement.parentElement !== proxy.element
        ) {
            proxy.element.insertBefore(
                this.equalSignElement,
                proxy.element.children[2]
            )
        }
    }
}
