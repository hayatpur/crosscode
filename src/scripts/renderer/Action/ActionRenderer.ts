import { Editor } from '../../editor/Editor'
import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
import { createEl } from '../../utilities/dom'
import { Action } from './Action'

/* ------------------------------------------------------ */
/*                     Action Renderer                    */
/* ------------------------------------------------------ */
export class ActionRenderer {
    action: Action
    element: HTMLElement

    /* ----------------------- Create ----------------------- */
    constructor(action: Action) {
        this.action = action

        // Create dom elements
        this.create()

        this.update()
    }

    create() {
        this.element = createEl('div', 'action')

        if (this.action.parent) {
            this.action.parent.renderer.element.appendChild(this.element)
        } else {
            document.body.appendChild(this.element)
        }
    }

    updateClasses() {
        this.action.state.isShowingSteps
            ? this.element.classList.add('is-showing-steps')
            : this.element.classList.remove('is-showing-steps')

        this.action.execution.nodeData.type == 'Program'
            ? this.element.classList.add('is-program')
            : this.element.classList.remove('is-program')
    }

    /* ----------------------- Render ----------------------- */
    update() {
        this.updateClasses()
        this.action.representation.updateActionVisual(this)
    }

    /* ----------------------- Destroy ---------------------- */

    destroy() {
        this.element.remove()
        this.element = null
        this.action = null
    }
}

export function getActionCoordinates(
    execution: ExecutionGraph | ExecutionNode,
    parentExecution: ExecutionGraph | ExecutionNode
) {
    if (execution.nodeData.type == 'BlockStatement') {
        let parentBbox = parentExecution
            ? getActionCoordinates(parentExecution, null)
            : { x: 0, y: 0, width: 0, height: 0 }

        let bbox: {
            x: number
            y: number
            width: number
            height: number
        } = { x: 0, y: 0, width: 0, height: 0 }

        execution = execution as ExecutionGraph

        if (execution.vertices.length == 0) {
            bbox.x = parentBbox.x
            bbox.y = parentBbox.y
        } else {
            bbox = getActionCoordinates(execution.vertices[0], null)

            let altBbox = {
                minX: bbox.x,
                minY: bbox.y,
                maxX: bbox.x + bbox.width,
                maxY: bbox.y + bbox.height,
            }

            for (let i = 1; i < execution.vertices.length; i++) {
                const pBbox = getActionCoordinates(execution.vertices[i], null)
                altBbox.minX = Math.min(altBbox.minX, pBbox.x)
                altBbox.minY = Math.min(altBbox.minY, pBbox.y)
                altBbox.maxX = Math.max(altBbox.maxX, pBbox.x + pBbox.width)
                altBbox.maxY = Math.max(altBbox.maxY, pBbox.y + pBbox.height)
            }

            bbox.x = altBbox.minX
            bbox.y = altBbox.minY
            bbox.width = altBbox.maxX - altBbox.minX
            bbox.height = altBbox.maxY - altBbox.minY
        }

        return {
            width: bbox.width,
            height: bbox.height,
            x: bbox.x - parentBbox.x,
            y: bbox.y - parentBbox.y,
        }
    } else {
        let bbox = Editor.instance.computeBoundingBoxForLoc(execution.nodeData.location)

        let parentBbox = parentExecution
            ? getActionCoordinates(parentExecution, null)
            : { x: 0, y: 0, width: 0, height: 0 }

        return {
            width: bbox.width + 10, // TODO Why us there an offset? Because monaco offsets after load
            height: bbox.height,
            x: bbox.x - parentBbox.x,
            y: bbox.y - parentBbox.y,
        }
    }
}
