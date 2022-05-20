import { Editor } from '../../editor/Editor'
import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { createEl } from '../../utilities/dom'
import { Ticker } from '../../utilities/Ticker'
import { Action } from '../Action/Action'
import { Camera } from '../Camera/Camera'
import { Focus } from './Focus'

/* ------------------------------------------------------ */
/*                Visualizes code execution               */
/* ------------------------------------------------------ */
export class Visualization {
    element: HTMLElement

    root: Action
    camera: Camera
    focus: Focus

    codeBackdrop: HTMLElement
    codeShadow: HTMLElement

    private _tickerId: string

    /* ----------------------- Create ----------------------- */
    constructor() {
        this.element = createEl('div', 'visualization', document.body)

        // Code backdrop
        this.codeBackdrop = createEl('div', 'code-backdrop', document.body)

        // Code shadow
        this.codeShadow = createEl('div', 'code-shadow', document.body)

        // Camera
        this.camera = new Camera(this)
        this.element.appendChild(this.camera.element)
        this.camera.onAddedToDom()

        this.focus = new Focus()

        this._tickerId = Ticker.instance.registerTick(this.tick.bind(this))
    }

    createRoot(execution: ExecutionGraph) {
        // Root action
        this.root = new Action(execution, null, {
            isInline: false,
        })
        this.root.controller.createSteps()

        this.camera.add(this.root.renderer.element)
    }

    /* ----------------------- Update ----------------------- */

    tick(dt: number) {
        const margin = Editor.instance.getMaxWidth() + 70
        this.element.style.left = `${margin}px`
        this.codeBackdrop.style.width = `${margin}px`
        this.codeShadow.style.width = `${margin}px`
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
