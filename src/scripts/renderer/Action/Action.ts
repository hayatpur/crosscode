import { EnvironmentState } from '../../environment/EnvironmentState'
import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
import { Executor } from '../../executor/Executor'
import { createRepresentation, getExecutionSteps } from '../../utilities/action'
import { ActionRenderer } from './ActionRenderer'
import { ActionState, createActionState } from './ActionState'
import { Representation } from './Dynamic/Representation'
import { updateMappingProxies } from './Mapping/ActionMapping'

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

    // Sub-steps
    steps: Action[] = []

    // Representation
    representation: Representation

    /**
     * Initializes an action.
     * @param execution
     * @param parent
     * @param options
     */
    constructor(execution: ExecutionGraph | ExecutionNode, parent: Action | null, options: Partial<ActionState> = {}) {
        this.execution = execution
        this.parent = parent
        this.state = createActionState(options)

        Action.all[this.state.id] = this

        this.representation = createRepresentation(this)
        this.renderer = new ActionRenderer(this)
    }

    update() {
        // Update the source code rendering
        this.renderer.update()

        const visualization = Executor.instance.visualization
        const mapping = visualization.mapping

        // Update mapping, resets time to 0 and then back
        // TODO: make cleaner
        if (mapping != null) {
            updateMappingProxies(mapping)
            const time = mapping.time
            mapping.time = 0
            setTimeout(() => {
                mapping.time = time
            })
        }

        // Update frames of the execution
        if (visualization.view != null) {
            visualization.view.setFrames(
                visualization.program.representation.getFrames(),
                visualization.program.execution.precondition as EnvironmentState
            )
        }
    }

    destroy() {
        this.renderer.destroy()
        this.steps.forEach((step) => step.destroy())
        this.representation.destroy()
        delete Action.all[this.state.id]
    }
}

/**
 * Breaks down the action into sub-steps.
 * @param action
 */
export function createSteps(action: Action) {
    if (action.state == undefined) {
        console.warn('Action state not found!')
        return
    }

    if (action.state.isShowingSteps) {
        console.warn('Steps already created! Destroying existing.')
        action.steps.forEach((step) => step.destroy())
    }

    action.steps = []

    let steps = getExecutionSteps(action.execution)

    for (let i = 0; i < steps.length; i++) {
        const step = new Action(steps[i], action)
        action.steps.push(step)
    }

    action.state.isShowingSteps = true
    action.update()
}

/**
 * Remove division of sub-steps, and show the original action.
 * @param action
 */
export function destroySteps(action: Action) {
    if (action.state == undefined) {
        console.warn('Action state not found!')
        return
    }

    action.steps.forEach((step) => step.destroy())
    action.steps = []

    action.state.isShowingSteps = false

    action.update()
}
