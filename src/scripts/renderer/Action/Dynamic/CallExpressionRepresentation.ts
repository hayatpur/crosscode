import * as monaco from 'monaco-editor'
import { ApplicationState } from '../../../ApplicationState'
import { createElement } from '../../../utilities/dom'
import { ActionState } from '../Action'
import { getTotalDuration } from '../Mapping/ControlFlowCursor'
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

    createSteps(): void {
        const action = ApplicationState.actions[this.actionId]

        const selection = ApplicationState.visualization.selections['main']
        const globalTime = selection.targetGlobalTime
        const timeDelta = {
            start: globalTime - action.globalTimeOffset,
            end: globalTime - action.globalTimeOffset - getTotalDuration(action.id),
        }

        super.createSteps()

        // If was before the global time, then seek to the start of the function call
        if (timeDelta.start < 0) {
            setTimeout(() => {
                const child = ApplicationState.actions[action.vertices[1]]
                const childVertex = ApplicationState.actions[child.vertices[0]]
                selection.targetGlobalTime = childVertex.globalTimeOffset + getTotalDuration(childVertex.id)
            }, 0)
        } else if (timeDelta.end >= 0) {
            setTimeout(() => {
                // const child = ApplicationState.actions[action.vertices[1]]
                const parent = ApplicationState.actions[action.parentID!]
                selection.targetGlobalTime = parent.globalTimeOffset + getTotalDuration(parent.id)
                selection._globalTime = parent.globalTimeOffset + getTotalDuration(parent.id)
            }, 100)
        }

        const proxy = action.proxy

        // const [argElement, bodyElement] = Array.from(proxy.element.children).filter(
        //     (child) =>
        //         child.classList.contains('action-proxy-container') ||
        //         child.classList.contains('action-proxy-placeholder')
        // )

        // const spatialParent = ApplicationState.actions[action.spatialParentID!]
        // spatialParent.representation.minimize()

        // Remove all action-proxy children
        // argElement.remove()
        // bodyElement.remove()

        // Add call expression label to placeholder
        // TODO

        // action.proxy.element.append(bodyElement)
    }
}
