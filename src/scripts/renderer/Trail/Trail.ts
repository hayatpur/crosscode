import { Action } from '../Action/Action'
import { EnvironmentRenderer } from '../View/Environment/EnvironmentRenderer'
import { TrailController } from './TrailController'
import { TrailRenderer } from './TrailRenderer'
import { TrailState } from './TrailState'

/* ------------------------------------------------------ */
/*      Trails visualize change via path or animation     */
/* ------------------------------------------------------ */
export class Trail {
    state: TrailState
    controller: TrailController
    renderer: TrailRenderer

    startEnvironment: EnvironmentRenderer
    endEnvironment: EnvironmentRenderer

    action: Action

    constructor(
        state: TrailState,
        startEnvironment: EnvironmentRenderer,
        endEnvironment: EnvironmentRenderer,
        action: Action
    ) {
        this.state = state

        this.action = action

        this.startEnvironment = startEnvironment
        this.endEnvironment = endEnvironment

        this.controller = new TrailController(this)
        this.renderer = new TrailRenderer()
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        this.controller.destroy()
        this.renderer.destroy()

        this.controller = null
        this.renderer = null
    }
}

/* ------------------------------------------------------ */
/*                    Helper functions                    */
/* ------------------------------------------------------ */
