import * as ESTree from 'estree'
import { Editor } from '../../editor/Editor'
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
    location: ESTree.SourceLocation,
    parentLocation: ESTree.SourceLocation | null
) {
    let bbox = Editor.instance.computeBoundingBoxForLoc(location)

    let parentBbox = parentLocation
        ? Editor.instance.computeBoundingBoxForLoc(parentLocation)
        : { x: 0, y: 0, width: 0, height: 0 }

    const paddingX = 0
    const paddingY = 0

    return {
        width: bbox.width + paddingX * 2 + 10, // TODO Why us there an offset?
        height: bbox.height + paddingY * 2,
        x: bbox.x - parentBbox.x - paddingX,
        y: bbox.y - parentBbox.y - paddingY,
    }
}
