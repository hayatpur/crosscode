import * as monaco from 'monaco-editor'
import { ApplicationState } from '../../../ApplicationState'
import { createElement } from '../../../utilities/dom'
import { ActionState } from '../Action'
import { ActionProxyState } from '../Mapping/ActionProxy'
import { Representation } from './Representation'

export class IfStatementRepresentation extends Representation {
    ifLabelElement: HTMLElement
    elseLabelElement: HTMLElement

    constructor(action: ActionState) {
        super(action)

        this.ifLabelElement = createElement('div', [
            'action-proxy-code-label',
            'action-proxy-if-label',
        ])
        this.ifLabelElement.innerText = 'if'
        monaco.editor
            .colorize(this.ifLabelElement.innerHTML, 'javascript', {})
            .then((html) => {
                this.ifLabelElement.innerHTML = html
            })

        this.elseLabelElement = createElement('div', [
            'action-proxy-code-label',
            'action-proxy-else-label',
        ])
        this.elseLabelElement.innerText = 'else'
        monaco.editor
            .colorize(this.elseLabelElement.innerHTML, 'javascript', {})
            .then((html) => {
                this.elseLabelElement.innerHTML = html
            })
    }

    updateProxyVisual(proxy: ActionProxyState) {
        super.updateProxyVisual(proxy)

        const action = ApplicationState.actions[proxy.actionID]
        if (!action.isShowingSteps) return

        if (this.ifLabelElement.parentElement == null) {
            const children = Array.from(proxy.element.children).filter(
                (child) => child.classList.contains('action-proxy')
            )

            // Remove all action-proxy children
            for (const child of children) {
                child.remove()
            }

            // Create four rows
            const rows = []
            for (let i = 0; i < 4; i++) {
                rows.push(
                    createElement('div', 'action-proxy-if-row', proxy.element)
                )
            }

            // Add the if label
            rows[0].append(this.ifLabelElement)

            // Append the binary expression to the top
            rows[0].append(children[0])

            // This if statement was unsuccessful and an else was reached
            if (
                action.vertices.length == 2 &&
                ApplicationState.actions[action.vertices[1]].execution.nodeData
                    .preLabel == 'Alternate'
            ) {
                // Add the else label
                rows[1].append(
                    createElement('div', 'action-proxy-if-placeholder')
                )

                rows[2].append(this.elseLabelElement)

                rows[3].append(children[1])
            }

            // This if statement was successful
            if (
                action.vertices.length == 2 &&
                ApplicationState.actions[action.vertices[1]].execution.nodeData
                    .preLabel == 'Consequent'
            ) {
                rows[1].append(children[1])

                rows[2].remove()
                rows[3].remove()
            }

            // Append the body to the bottom
            // bottom.append(children[1])
        }
    }
}
