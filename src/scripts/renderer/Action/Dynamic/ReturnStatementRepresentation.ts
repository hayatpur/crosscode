import * as monaco from 'monaco-editor'
import { ApplicationState } from '../../../ApplicationState'
import { createElement } from '../../../utilities/dom'
import { assert } from '../../../utilities/generic'
import { ActionState } from '../Action'
import { getTotalDuration } from '../Mapping/ControlFlowCursor'
import { Representation } from './Representation'

export class ReturnStatementRepresentation extends Representation {
    returnLabelElement: HTMLElement

    constructor(action: ActionState) {
        super(action)

        this.returnLabelElement = createElement('div', ['action-proxy-code-label', 'action-proxy-return-label'])
        this.returnLabelElement.innerText = 'return'
        monaco.editor.colorize(this.returnLabelElement.innerHTML, 'javascript', {}).then((html) => {
            this.returnLabelElement.innerHTML = html
        })

        this.shouldHover = true
    }

    focus() {
        const action = ApplicationState.actions[this.actionId]

        // Update time
        const spatialId = action.spatialParentID
        assert(spatialId != null, 'Spatial parent ID is null')

        const spatial = ApplicationState.actions[spatialId]
        assert(spatial.isSpatial, 'Action is not spatial')
        const controlFlow = spatial.controlFlow
        assert(controlFlow != null, 'Control flow is null')

        const selection = ApplicationState.visualization.selections[controlFlow.cursor.selectionId]

        const child = ApplicationState.actions[action.vertices[0]]
        selection.targetGlobalTime = child.globalTimeOffset + getTotalDuration(child.id)
    }

    postCreate() {
        this.createSteps()
    }

    createSteps(): void {
        super.createSteps()

        const action = ApplicationState.actions[this.actionId]
        const proxy = action.proxy
        if (!action.isShowingSteps) return

        const children = Array.from(proxy.element.children).filter((child) =>
            child.classList.contains('action-proxy-container')
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

    destroySteps(): void {
        super.destroySteps()

        this.returnLabelElement.remove()
    }
}
