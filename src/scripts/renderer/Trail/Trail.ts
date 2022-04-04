import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
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

    execution: ExecutionGraph | ExecutionNode

    time: number = 0

    constructor(
        state: TrailState,
        startEnvironment: EnvironmentRenderer,
        endEnvironment: EnvironmentRenderer,
        execution: ExecutionGraph | ExecutionNode
    ) {
        this.state = state

        this.execution = execution

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
