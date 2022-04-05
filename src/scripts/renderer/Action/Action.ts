import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
import { Executor } from '../../executor/Executor'
import { createRepresentation, getAllSteps } from '../../utilities/action'
import { View } from '../View/View'
// import { ActionBundle } from './ActionBundle'
import { ActionController } from './ActionController'
import { ActionCursor } from './ActionCursor'
import { ActionInteractionArea } from './ActionInteractionArea'
import { ActionRenderer } from './ActionRenderer'
import { ActionState, createActionState } from './ActionState'
import { Representation } from './Dynamic/Representation'
import { ActionMapping } from './Mapping/ActionMapping'
import { ActionProxy } from './Mapping/ActionProxy'

/* ----------------------- Options ---------------------- */
export interface CreateActionOptions {
    inline?: boolean
    spacingDelta?: number
    isFocusedStep?: boolean
    isSelected?: boolean
    isShowingView?: boolean
    inSitu?: boolean
    stripped?: boolean
    skipOver?: boolean
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
    steps: Action[] = []

    // Views
    views: View[] = []

    // Cursor
    cursor: ActionCursor

    // Interaction areas
    interactionAreas: ActionInteractionArea[] = []

    // Representation
    representation: Representation

    // Source-code to view mapping
    mapping: ActionMapping

    parent: Action

    // Misc
    stripped: boolean

    time: number = 0

    actionTemporalStacks: Action[][] = []

    proxy: ActionProxy

    skipOver: boolean = false

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
        this.state.isShowingView = options.isShowingView ?? false
        this.state.inSitu = options.inSitu ?? false
        this.stripped = options.stripped ?? false
        this.skipOver = options.skipOver ?? false

        this.renderer = new ActionRenderer()
        this.controller = new ActionController(this)

        // Create interaction areas
        if (this.state.inline) {
            setTimeout(() => {
                this.interactionAreas.push(new ActionInteractionArea(this, this.execution))
                // if (instanceOfExecutionGraph(execution)) {
                //     for (const child of execution.vertices) {
                //         this.interactionAreas.push(new ActionInteractionArea(this, child))
                //     }
                // }
            })
        }

        // Create a view
        if (!this.state.inline) {
            this.controller.createView()
            // if (instanceOfExecutionGraph(execution)) {
            //     for (const child of execution.vertices) {
            //         this.controller.createView([child])
            //     }
            //     // this.controller.createView([(this.execution as ExecutionGraph).vertices[0]])
            //     // this.controller.createView([(this.execution as ExecutionGraph).vertices[1]])
            // }
        }

        // Create cursor
        this.cursor = new ActionCursor(this)

        this.renderer.render(this)

        // Dynamic representations
        this.representation = createRepresentation(this)

        // Create mapping
        if (!this.state.inline) {
            this.mapping = new ActionMapping(this)
        }

        setTimeout(() => {
            this.mapping?.render()
        }, 500)
    }

    getStepTime() {
        return this.time
    }

    getAllFrames() {
        return getAllSteps(this).filter((step) => step.steps.length == 0 && !step.skipOver)
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        Executor.instance.visualization.focus.actions.delete(this)

        this.controller.destroy()
        this.renderer.destroy()

        this.representation?.destroy()

        this.cursor?.destroy()

        this.mapping?.destroy()

        // TODO Destroy interaction areas

        this.renderer = null
        this.controller = null
    }
}
