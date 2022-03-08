import { Editor } from '../../editor/Editor'
import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { createEl } from '../../utilities/dom'
import { Ticker } from '../../utilities/Ticker'
import { Action } from '../Action/Action'
import { Camera } from '../Camera/Camera'

/* ------------------------------------------------------ */
/*                Visualizes code execution               */
/* ------------------------------------------------------ */
export class Visualization {
    element: HTMLElement

    root: Action
    camera: Camera

    private _tickerId: string

    /* ----------------------- Create ----------------------- */

    constructor(execution: ExecutionGraph) {
        this.element = createEl('div', 'visualization', document.body)

        // Camera
        this.camera = new Camera()
        this.element.appendChild(this.camera.element)

        // Root action
        this.root = new Action(execution, { shouldExpand: true })
        this.camera.add(this.root.renderer.element)

        this._tickerId = Ticker.instance.registerTick(this.tick.bind(this))
    }

    /* ----------------------- Update ----------------------- */

    tick(dt: number) {
        const margin = Editor.instance.getMaxWidth() + 100
        this.element.style.left = `${margin}px`
    }

    /* ----------------------- Destroy ---------------------- */

    destroy() {
        Ticker.instance.removeTickFrom(this._tickerId)

        this.camera.destroy()
        this.element.remove()
        this.root.destroy()

        this.element = null
        this.root = null
        this.camera = null
    }
}
