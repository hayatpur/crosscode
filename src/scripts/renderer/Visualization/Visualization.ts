import { Editor } from '../../editor/Editor'
import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { Executor } from '../../executor/Executor'
import { createEl } from '../../utilities/dom'
import { Ticker } from '../../utilities/Ticker'
import { Action } from '../Action/Action'
import { Camera } from '../Camera/Camera'
import { Timeline } from '../Timeline/Timeline'

/* ------------------------------------------------------ */
/*                Visualizes code execution               */
/* ------------------------------------------------------ */
export class Visualization {
    element: HTMLElement

    root: Action
    camera: Camera

    timelines: Timeline[] = []

    private _tickerId: string

    startFogOfWar: HTMLElement
    endFogOfWar: HTMLElement

    /* ----------------------- Create ----------------------- */

    constructor(execution: ExecutionGraph) {
        this.element = createEl('div', 'visualization', document.body)

        // Fog of war
        this.startFogOfWar = createEl('div', 'fog-of-war-start', this.element)
        this.endFogOfWar = createEl('div', 'fog-of-war-end', this.element)

        // Camera
        this.camera = new Camera()
        this.element.appendChild(this.camera.element)
        this.camera.onAddedToDom()

        this._tickerId = Ticker.instance.registerTick(this.tick.bind(this))
    }

    createRoot(execution: ExecutionGraph) {
        // Root action
        this.root = new Action(execution, { shouldExpand: true, shouldShowSteps: false })
        this.camera.add(this.root.renderer.element)
    }

    /* ----------------------- Update ----------------------- */

    tick(dt: number) {
        const margin = Editor.instance.getMaxWidth() + 100
        this.element.style.left = `${margin}px`

        // this.updateAllConnections()

        if (!Executor.instance.PARAMS.focus) {
            this.endFogOfWar.classList.add('hidden')
            this.startFogOfWar.classList.add('hidden')
        } else {
            this.endFogOfWar.classList.remove('hidden')
            this.startFogOfWar.classList.remove('hidden')
        }
    }

    updateAllConnections() {
        this.timelines.forEach((timeline) => {
            timeline.renderer.updateConnections(timeline)
        })
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
