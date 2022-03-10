import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
import { Timeline } from '../Timeline/Timeline'
import { ActionController } from './ActionController'
import { ActionRenderer } from './ActionRenderer'
import { ActionState, createActionState } from './ActionState'

/* ----------------------- Options ---------------------- */
export interface CreateActionOptions {
    shouldExpand?: boolean
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
        this.timeline = new Timeline(this, options)

        this.controller = new ActionController(this)

        this.renderer.body.appendChild(this.timeline.renderer.element)

        this.renderer.render(this)
    }

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
