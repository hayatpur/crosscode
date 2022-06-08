import { Editor } from '../../../editor/Editor'
import { ExecutionGraph } from '../../../execution/graph/ExecutionGraph'
import { Action } from '../Action'
import { ActionRenderer, getActionCoordinates } from '../ActionRenderer'
import { Representation } from './Representation'

export class BlockStatementRepresentation extends Representation {
    constructor(action: Action) {
        super(action)
    }

    updateActionVisual(renderer: ActionRenderer) {
        const loc = this.action.execution.nodeData.location
        const parentLocation = this.action.parent.execution.nodeData.location

        let parentBbox = parentLocation
            ? Editor.instance.computeBoundingBoxForLoc(parentLocation)
            : { x: 0, y: 0, width: 0, height: 0 }

        let bbox: {
            x: number
            y: number
            width: number
            height: number
        } = { x: 0, y: 0, width: 0, height: 0 }

        const execution = this.action.execution as ExecutionGraph

        if (execution.vertices.length == 0) {
            bbox.x = parentBbox.x
            bbox.y = parentBbox.y
        } else {
            bbox = getActionCoordinates(execution.vertices[0].nodeData.location, null)

            let altBbox = {
                minX: bbox.x,
                minY: bbox.y,
                maxX: bbox.x + bbox.width,
                maxY: bbox.y + bbox.height,
            }

            for (let i = 1; i < execution.vertices.length; i++) {
                const pBbox = getActionCoordinates(execution.vertices[i].nodeData.location, null)
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

        renderer.element.style.left = `${bbox.x - parentBbox.x}px`
        renderer.element.style.top = `${bbox.y - parentBbox.y}px`
        renderer.element.style.width = `${bbox.width}px`
        renderer.element.style.height = `${bbox.height}px`
    }
}
