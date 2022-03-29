import { ExecutionGraph, instanceOfExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
import { Executor } from '../../executor/Executor'
import { createRepresentation } from '../../utilities/action'
import { View } from '../View/View'
import { ActionBundle } from './ActionBundle'
import { ActionController } from './ActionController'
import { ActionCursor } from './ActionCursor'
import { ActionInteractionArea } from './ActionInteractionArea'
import { ActionRenderer } from './ActionRenderer'
import { ActionState, createActionState } from './ActionState'
import { Representation } from './Dynamic/Representation'

/* ----------------------- Options ---------------------- */
export interface CreateActionOptions {
    inline?: boolean
    spacingDelta?: number
    isFocusedStep?: boolean
    isSelected?: boolean
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

    // Sub-steps
    steps: (Action | ActionBundle)[] = []

    // Views
    views: View[] = []
    viewTimes: number[] = []

    // Cursor
    cursor: ActionCursor

    // Interaction areas
    interactionAreas: ActionInteractionArea[] = []

    // Representation
    representation: Representation

    parent: Action

    constructor(
        execution: ExecutionGraph | ExecutionNode,
        parent: Action,
        options: CreateActionOptions
    ) {
        this.execution = execution

        this.parent = parent

        Executor.instance.visualization.focus.actions.add(this)

        this.state = createActionState()
        this.state.spacingDelta = options.spacingDelta ?? 0
        this.state.inline = options.inline ?? false
        this.state.isFocusedStep = options.isFocusedStep ?? false
        this.state.isSelected = options.isSelected ?? false

        this.renderer = new ActionRenderer()
        this.controller = new ActionController(this)

        // Create interaction areas
        if (this.state.inline) {
            setTimeout(() => {
                this.interactionAreas.push(new ActionInteractionArea(this, this.execution))
                if (instanceOfExecutionGraph(execution)) {
                    for (const child of execution.vertices) {
                        this.interactionAreas.push(new ActionInteractionArea(this, child))
                    }
                }
                // } else {
                //     this.interactionAreas.push(new ActionInteractionArea(this, this.execution))
                // }
            })
        }

        // Create cursor
        this.cursor = new ActionCursor(this)

        this.renderer.render(this)

        // Dynamic representations
        this.representation = createRepresentation(this)
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        Executor.instance.visualization.focus.actions.delete(this)

        this.controller.destroy()
        this.renderer.destroy()

        this.representation?.destroy()

        this.cursor?.destroy()

        // TODO Destroy interaction areas

        this.renderer = null
        this.controller = null
    }
}
