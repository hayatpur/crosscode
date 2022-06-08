import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
import { EnvironmentRenderer } from '../View/Environment/EnvironmentRenderer'
import { CreateTrailRenderer } from './Renderers/CreateTrailRenderer'
import { MoveTrailRenderer } from './Renderers/MoveTrailRenderer'
import { PartialCreateTrailRenderer } from './Renderers/PartialCreateTrailRenderer'
import { PartialMoveTrailRenderer } from './Renderers/PartialMoveTrailRenderer'
import { TrailRenderer } from './Renderers/TrailRenderer'
import { TrailController } from './TrailController'
import { TrailState, TrailType } from './TrailState'

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
        this.renderer = createTrailRenderer(this)
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        this.controller.destroy()
        this.renderer.destroy()

        this.controller = null
        this.renderer = null

        this.startEnvironment = null
        this.endEnvironment = null
        this.execution = null
        this.state = null
    }
}

export function createTrailRenderer(trail: Trail) {
    switch (trail.state.type) {
        case TrailType.Create:
            return new CreateTrailRenderer(trail)
        case TrailType.PartialCreate:
            return new PartialCreateTrailRenderer(trail)
        case TrailType.Move:
            return new MoveTrailRenderer(trail)
        case TrailType.PartialMove:
            return new PartialMoveTrailRenderer(trail)
        default:
            throw new Error('Unsupported trail type')
    }
}
