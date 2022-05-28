import { EnvironmentState } from '../../environment/EnvironmentState'
import { Action } from '../Action/Action'
import { TrailGroup } from '../Trail/TrailGroup'
import { EnvironmentRenderer } from './Environment/EnvironmentRenderer'
import { View } from './View'

export class ViewController {
    view: View

    /* ----------------------- Create ----------------------- */

    constructor(view: View) {
        this.view = view
    }

    createStep() {
        const renderer = new EnvironmentRenderer()
        this.view.renderer.element.appendChild(renderer.element)
        return renderer
    }

    /* -------------------- Modify State -------------------- */
    setFrames(frames: [env: EnvironmentState, actionId: string][], preFrame: EnvironmentState) {
        /* -------------------- Update frames ------------------- */
        this.view.state.frames = frames.map(([env, actionId]) => env)
        this.view.renderer.syncFrames()

        this.view.state.preFrame = preFrame

        /* -------------------- Update trails ------------------- */

        // Clean up existing ones
        Object.values(this.view.trails).forEach((trail) => trail.destroy())
        this.view.trails = []

        // TODO: Trails
        for (let i = 0; i < frames.length; i++) {
            const [env, actionId] = frames[i]
            const action = Action.all[actionId]

            const trailGroup = new TrailGroup(
                action.execution,
                i == 0 ? this.view.renderer.preRenderer : this.view.renderer.renderedFrames[i - 1],
                this.view.renderer.renderedFrames[i]
            )
            this.view.trails.push(trailGroup)
        }

        // Update dirty flag
        this.view.dirty = true
    }

    /* ------------------------ Focus ----------------------- */
    secondaryFocus(dataIds: Set<string>) {
        for (const env of this.view.renderer.renderedFrames) {
            env.secondaryFocus(dataIds)
        }
    }

    focus(dataIds: Set<string>) {
        for (const env of this.view.renderer.renderedFrames) {
            env.focus(dataIds)
        }
    }

    clearFocus() {
        for (const env of this.view.renderer.renderedFrames) {
            env.clearFocus()
        }
    }

    /* ----------------------- Destroy ---------------------- */

    destroy() {}
}
