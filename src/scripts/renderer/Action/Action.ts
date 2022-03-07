import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
import { Timeline } from '../Timeline/Timeline'
import { ActionController } from './ActionController'
import { ActionRenderer } from './ActionRenderer'
import { ActionState, createActionState } from './ActionState'

/* ----------------------- Options ---------------------- */
export interface CreateActionOptions {
    shouldExpand?: boolean
    shouldShowBeforeAndAfter?: boolean
    shouldShowSteps?: boolean
}

/* ------------------------------------------------------ */
/*    An Action visualizes a node in program execution    */
/* ------------------------------------------------------ */
export class Action {
    // Corresponding execution
    execution: ExecutionGraph | ExecutionNode

    // State
    state: ActionState
    renderer: ActionRenderer
    controller: ActionController

    // Timeline
    timeline: Timeline

    constructor(execution: ExecutionGraph | ExecutionNode, options: CreateActionOptions) {
        this.execution = execution

        this.state = createActionState()
        this.renderer = new ActionRenderer()

        this.controller = new ActionController(this)

        this.timeline = new Timeline(this, options)

        this.renderer.render(this)
    }

    tick(dt: number) {}

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        this.controller.destroy()
        this.renderer.destroy()
        this.timeline?.destroy()

        this.renderer = null
        this.timeline = null
        this.controller = null
    }
}
