import { Editor } from '../../editor/Editor'
import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { createEl } from '../../utilities/dom'
import { Ticker } from '../../utilities/Ticker'
import { Action } from '../Action/Action'
import { Camera } from '../Camera/Camera'
import { CodeQueryCreator } from '../Queries/CodeQueryCreator'
import { Focus } from './Focus'
import { Minimap } from './Minimap'

/* ------------------------------------------------------ */
/*                Visualizes code execution               */
/* ------------------------------------------------------ */
export class Visualization {
    element: HTMLElement

    root: Action
    camera: Camera

    // timelines: Timeline[] = []

    private _tickerId: string

    // Focus
    fogOfWar: HTMLElement
    focus: Focus

    codeBackdrop: HTMLElement

    minimap: Minimap

    codeQueryCreator: CodeQueryCreator

    /* ----------------------- Create ----------------------- */

    constructor(execution: ExecutionGraph) {
        this.element = createEl('div', 'visualization', document.body)

        // Fog of war
        this.fogOfWar = createEl('div', 'fog-of-war', this.element)

        // Code backdrop
        this.codeBackdrop = createEl('div', 'code-backdrop', document.body)

        // Camera
        this.camera = new Camera(this)
        this.element.appendChild(this.camera.element)
        this.camera.onAddedToDom()

        this.focus = new Focus()

        this._tickerId = Ticker.instance.registerTick(this.tick.bind(this))

        this.minimap = new Minimap()

        this.codeQueryCreator = new CodeQueryCreator()
    }

    createRoot(execution: ExecutionGraph) {
        // Root action
        this.root = new Action(execution, null, {
            inline: false,
        })
        this.root.controller.createSteps()
        this.root.controller.createView(this.root.steps.length)
        this.root.renderer.render(this.root)

        this.camera.add(this.root.renderer.element)

        setTimeout(() => {
            const actionBbox = this.root.renderer.element.getBoundingClientRect()
            const cameraBbox = this.camera.element.getBoundingClientRect()
            this.root.state.position.y = cameraBbox.height / 2 - actionBbox.height / 2
        })
        this.root.state.position.x = 200

        this.minimap.addAction(this.root)
    }

    /* ----------------------- Update ----------------------- */

    tick(dt: number) {
        const margin = Editor.instance.getMaxWidth() + 100
        this.element.style.left = `${margin}px`
        this.codeBackdrop.style.width = `${margin}px`
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
