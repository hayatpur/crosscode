import { EnvironmentState, Residual } from '../../environment/EnvironmentState'
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

        for (let i = 0; i < frames.length; i++) {
            const [env, actionId] = frames[i]
            const action = Action.all[actionId]

            const trailGroup = new TrailGroup(action.execution, i)
            this.trails.push(trailGroup)
        }

        this.renderer.update()

        /* ------------------ Update residuals ------------------ */

        // Clean up existing residuals
        for (const frame of this.state.frames) {
            frame.residuals = []
        }

        // Clean up existing timestamps
        for (const frame of this.state.frames) {
            frame.timestamps = {}
        }

        // Create new residuals
        // TODO: can make it linear time by maintaining residuals
        for (let i = 0; i < frames.length; i++) {
            // For each frame
            const [frameEnvironment, frameAction] = frames[i]
            const residuals: Residual[][] = []

            for (let j = 0; j <= i; j++) {
                // For each previous frame
                const [previousFrameEnvironment, previousFrameAction] = frames[j]
                const trail = this.trails[j]

                const ppFrame = j == 0 ? this.state.preFrame : frames[j - 1][0]

                residuals.push(trail.computeResidual(ppFrame))
                trail.applyTimestamps(frameEnvironment)
            }

            frameEnvironment.residuals = residuals
        }
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
