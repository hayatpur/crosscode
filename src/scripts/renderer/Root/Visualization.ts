import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { createEl } from '../../utilities/dom'
import { Action } from '../Action/Action'
import { Camera } from '../Camera/Camera'

/* ------------------------------------------------------ */
/*                Visualizes code execution               */
/* ------------------------------------------------------ */
export class Visualization {
    element: HTMLElement

    root: Action
    camera: Camera

    /* ----------------------- Create ----------------------- */

    constructor(execution: ExecutionGraph) {
        this.element = createEl('div', 'visualization', document.body)

        this.root = new Action(execution, { shouldExpand: true })
        this.element.appendChild(this.root.renderer.element)

        this.camera = new Camera(this.element)
    }

    /* ----------------------- Update ----------------------- */

    tick(dt: number) {}

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        this.element.remove()
        this.root.destroy()

        this.element = null
        this.root = null
        this.camera = null
    }
}
