import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
import { EnvironmentRenderer } from '../View/Environment/EnvironmentRenderer'
import { CreateTrailRenderer } from './Renderers/CreateTrailRenderer'
import { MoveTrailRenderer } from './Renderers/MoveTrailRenderer'
import { PartialCreateTrailRenderer } from './Renderers/PartialCreateTrailRenderer'
import { PartialMoveTrailRenderer } from './Renderers/PartialMoveTrailRenderer'
import { TrailRenderer } from './Renderers/TrailRenderer'
import { TrailState, TrailType } from './TrailState'

/* ------------------------------------------------------ */
/*      Trails visualize change via path or animation     */
/* ------------------------------------------------------ */
export class Trail {
    state: TrailState
    renderer: TrailRenderer
    execution: ExecutionGraph | ExecutionNode

    time: number

    constructor(state: TrailState, execution: ExecutionGraph | ExecutionNode, time: number) {
        this.state = state
        this.execution = execution
        this.renderer = createTrailRenderer(this)
        this.time = time
    }

    /* ----------------------- Update ----------------------- */
    update(amount: number, environment: EnvironmentRenderer, totalTime: number) {
        this.renderer.update(amount, environment, totalTime)
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        this.renderer.destroy()
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
            throw new Error(`Unsupported trail type ${trail.state.type}`)
    }
}
