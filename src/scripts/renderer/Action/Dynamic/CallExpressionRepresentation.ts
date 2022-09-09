import * as monaco from 'monaco-editor'
import { ApplicationState } from '../../../ApplicationState'
import { createElement } from '../../../utilities/dom'
import { collapseActionIntoAbyss } from '../Abyss'
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
                let firstChild = ApplicationState.actions[action.vertices[1]]
                while (firstChild.vertices.length > 0) {
                    firstChild = ApplicationState.actions[firstChild.vertices[0]]
                }
                selection.targetGlobalTime = firstChild.globalTimeOffset + getTotalDuration(firstChild.id)
            }, 0)
        } else if (timeDelta.end >= 0) {
            setTimeout(() => {
                let lastChild = ApplicationState.actions[action.vertices.at(-1)!]
                while (lastChild.vertices.length > 0) {
                    lastChild = ApplicationState.actions[lastChild.vertices.at(-1)!]
                }

                // const parent = ApplicationState.actions[action.parentID!]
                selection.targetGlobalTime = lastChild.globalTimeOffset + getTotalDuration(lastChild.id)
                selection._globalTime = lastChild.globalTimeOffset + getTotalDuration(lastChild.id)

                setTimeout(() => {
                    const lastChildParent = ApplicationState.actions[lastChild.parentID!]
                    lastChildParent.representation.focus()
                }, 0)
            }, 100)
        }

        const proxy = action.proxy

        // const [argElement, bodyElement] = Array.from(proxy.element.children).filter(
        //     (child) =>
        //         child.classList.contains('action-proxy-container') ||
        //         child.classList.contains('action-proxy-placeholder')
        // )

        if (ApplicationState.visualization.PARAMS.Closure) {
            const spatialParent = ApplicationState.actions[action.spatialParentID!]
            spatialParent.representation.minimize()

            if (spatialParent.parentID != null) {
                const spatialParentParent = ApplicationState.actions[spatialParent.parentID!]
                const spatialParentParentSpatialParent = ApplicationState.actions[spatialParentParent.spatialParentID!]
                if (
                    spatialParentParentSpatialParent.minimized &&
                    spatialParentParentSpatialParent.execution.nodeData.type != 'Program'
                ) {
                    collapseActionIntoAbyss(spatialParentParentSpatialParent.id)
                }
            }
        }

        // Remove all action-proxy children
        // argElement.remove()
        // bodyElement.remove()

        // Add call expression label to placeholder
        // TODO

        // action.proxy.element.append(bodyElement)
    }
}
