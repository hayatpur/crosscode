import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
import { createRepresentation, isExpression } from '../../utilities/action'
import { View } from '../View/View'
import { ActionController } from './ActionController'
import { ActionInteractionArea } from './ActionInteractionArea'
import { ActionRenderer } from './ActionRenderer'
import { ActionState, createActionState } from './ActionState'
import { Representation } from './Dynamic/Representation'
import { ActionMapping } from './Mapping/ActionMapping'
import { ActionProxy } from './Mapping/ActionProxy'

/* ------------------------------------------------------ */
/*    An Action visualizes a node in program execution    */
/* ------------------------------------------------------ */
export class Action {
    static all: { [id: string]: Action } = {}

    // Parent or null if root
    parent: Action | null

    // Corresponding execution
    execution: ExecutionGraph | ExecutionNode

    // State, renderer, controller
    state: ActionState
    renderer: ActionRenderer
    controller: ActionController

    // Sub-steps
    steps: Action[] = []

    // View
    view: View

    // Source-code to view mapping
    mapping: ActionMapping

    // Interaction areas
    interactionArea: ActionInteractionArea

    // Proxy in the mapping
    proxy: ActionProxy

    // Flag for if it needs to re-render
    dirty: boolean = true

    // Representation
    representation: Representation

    constructor(
        execution: ExecutionGraph | ExecutionNode,
        parent: Action,
        options: Partial<ActionState> = {}
    ) {
        this.execution = execution
        this.parent = parent
        this.state = createActionState(options)

        if (isExpression(this.execution)) {
            this.state.isExpression = true
        }

        Action.all[this.state.id] = this

        this.renderer = new ActionRenderer(this)
        this.controller = new ActionController(this)
        this.representation = createRepresentation(this)

        // Create interaction area (on source code)
        if (this.state.isInline) {
            this.interactionArea = new ActionInteractionArea(this, this.execution)
        }

        // Create mapping for source-code to view
        if (!this.state.isInline) {
            this.mapping = new ActionMapping(this)
        }

        // Create a view
        if (!this.state.isInline) {
            this.view = new View(this)
        }
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        delete Action.all[this.state.id]

        this.controller.destroy()
        this.renderer.destroy()
        this.mapping?.destroy()

        // TODO Destroy interaction areas

        this.renderer = null
        this.controller = null
    }
}
