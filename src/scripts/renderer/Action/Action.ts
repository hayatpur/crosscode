import { ExecutionGraph, instanceOfExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
import { Executor } from '../../executor/Executor'
import { Timeline } from '../Timeline/Timeline'
import { ActionController } from './ActionController'
import { ActionInteractionArea } from './ActionInteractionArea'
import { ActionRenderer } from './ActionRenderer'
import { ActionState, createActionState } from './ActionState'

/* ----------------------- Options ---------------------- */
export interface CreateActionOptions {
    shouldExpand?: boolean
    shouldShowSteps?: boolean
    isRoot?: boolean
    origin?: HTMLElement
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

    // Interaction areas
    interactionAreas: ActionInteractionArea[] = []

    constructor(execution: ExecutionGraph | ExecutionNode, options: CreateActionOptions) {
        this.execution = execution
        this.origin = options.origin

        Executor.instance.visualization.focus.actions.add(this)

        this.state = createActionState()
        this.renderer = new ActionRenderer()
        this.timeline = new Timeline(this, options)

        this.controller = new ActionController(this)

        this.renderer.body.appendChild(this.timeline.renderer.element)

        this.renderer.render(this)

        // Create interaction areas
        setTimeout(() => {
            this.interactionAreas.push(new ActionInteractionArea(this, this.execution))

            if (instanceOfExecutionGraph(execution)) {
                for (const child of execution.vertices) {
                    this.interactionAreas.push(new ActionInteractionArea(this, child))
                }
            }
        }, 1000)
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        Executor.instance.visualization.focus.actions.delete(this)

        this.controller.destroy()
        this.renderer.destroy()
        this.timeline?.destroy()

        this.renderer = null
        this.timeline = null
        this.controller = null
    }
}
