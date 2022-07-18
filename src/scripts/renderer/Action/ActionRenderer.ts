import * as ESTree from 'estree'
import { Editor } from '../../editor/Editor'
import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode, NodeData } from '../../execution/primitive/ExecutionNode'
import { createElement } from '../../utilities/dom'
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
        this.element = createElement('div', 'action')
        if (this.action.parent != null) {
            this.action.parent.renderer.element.appendChild(this.element)
        } else {
            document.body.appendChild(this.element)
        }

        this.update()
    }

    /* ----------------------- Render ----------------------- */
    update() {
        this.action.state.isShowingSteps
            ? this.element.classList.add('is-showing-steps')
            : this.element.classList.remove('is-showing-steps')

        this.action.representation.updateActionVisual(this)
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        this.element.remove()
    }
}

export function getActionCoordinates(
    execution: ExecutionGraph | ExecutionNode,
    parentExecution?: ExecutionGraph | ExecutionNode
): { x: number; y: number; width: number; height: number } {
    if (execution.nodeData.type == 'BlockStatement') {
        let parentBbox = parentExecution ? getActionCoordinates(parentExecution) : { x: 0, y: 0, width: 0, height: 0 }

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
            bbox = getActionCoordinates(execution.vertices[0])

            let altBbox = {
                minX: bbox.x,
                minY: bbox.y,
                maxX: bbox.x + bbox.width,
                maxY: bbox.y + bbox.height,
            }

            for (let i = 1; i < execution.vertices.length; i++) {
                const pBbox = getActionCoordinates(execution.vertices[i])
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

        // if (execution.vertices.some((v) => isChunk(v.nodeData))) {
        //     const indentation = (execution.nodeData.location as ESTree.SourceLocation).start.column
        //     bbox.width -= indentation * 4
        // }

        return {
            width: bbox.width,
            height: bbox.height,
            x: bbox.x - parentBbox.x,
            y: bbox.y - parentBbox.y,
        }
    } else {
        const location = execution.nodeData.location as ESTree.SourceLocation
        let bbox = Editor.instance.computeBoundingBoxForLoc(location)

        let parentBbox = parentExecution ? getActionCoordinates(parentExecution) : { x: 0, y: 0, width: 0, height: 0 }

        if (isChunk(execution.nodeData)) {
            const indentation = location.start.column
            // const charWidth = bbox.width / (location.end.column - location.start.column)
            // console.log(charWidth)
            bbox.width -= indentation * 10
        }

        return {
            width: bbox.width, // TODO Why us there an offset? Because monaco offsets after load
            height: bbox.height,
            x: bbox.x - parentBbox.x,
            y: bbox.y - parentBbox.y,
        }
    }
}

export function isChunk(nodeData: NodeData) {
    const chunks = new Set(['IfStatement', 'WhileStatement', 'DoWhileStatement', 'ForStatement'])
    return chunks.has(nodeData.type ?? '')
}
