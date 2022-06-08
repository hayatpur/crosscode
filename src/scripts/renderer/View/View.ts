import { EnvironmentState } from '../../environment/EnvironmentState'
import { Action } from '../Action/Action'
import { TrailGroup } from '../Trail/TrailGroup'
import { ViewRenderer } from './ViewRenderer'
import { createViewState, ViewState } from './ViewState'

/* ------------------------------------------------------ */
/*        View displays a series of program states        */
/* ------------------------------------------------------ */
export class View {
    // State, renderer, controller
    state: ViewState
    renderer: ViewRenderer

    // Like animation paths (that are acting on a given animation)
    trails: TrailGroup[] = []

    constructor() {
        this.state = createViewState()
        this.renderer = new ViewRenderer(this)
    }

    /* -------------------- Modify State -------------------- */
    setFrames(frames: [env: EnvironmentState, actionId: string][], preFrame: EnvironmentState) {
        /* -------------------- Update frames ------------------- */
        this.state.frames = frames.map(([env, actionId]) => env)
        this.renderer.syncFrames()

        this.state.preFrame = preFrame

        /* -------------------- Update trails ------------------- */

        // Clean up existing ones
        Object.values(this.trails).forEach((trail) => trail.destroy())
        this.trails = []

        // TODO: Trails
        for (let i = 0; i < frames.length; i++) {
            const [env, actionId] = frames[i]
            const action = Action.all[actionId]

            const trailGroup = new TrailGroup(
                action.execution,
                i == 0 ? this.renderer.preRenderer : this.renderer.renderedFrames[i - 1],
                this.renderer.renderedFrames[i]
            )
            this.trails.push(trailGroup)
        }

        this.renderer.update()
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        this.state = null

        this.renderer.destroy()
        this.renderer = null

        this.trails.forEach((trail) => trail.destroy())
        this.trails = []
    }
}
