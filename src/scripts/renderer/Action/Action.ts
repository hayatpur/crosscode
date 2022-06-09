import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
import { Executor } from '../../executor/Executor'
import { createRepresentation, getExecutionSteps } from '../../utilities/action'
import { ActionRenderer } from './ActionRenderer'
import { ActionState, createActionState } from './ActionState'
import { Representation } from './Dynamic/Representation'

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

    constructor(
        execution: ExecutionGraph | ExecutionNode,
        parent: Action,
        options: Partial<ActionState> = {}
    ) {
        this.execution = execution
        this.parent = parent
        this.state = createActionState(options)

        Action.all[this.state.id] = this

        this.representation = createRepresentation(this)
        this.renderer = new ActionRenderer(this)
    }

    /* ------------------------ Steps ----------------------- */
    createSteps() {
        if (this.state.isShowingSteps) {
            console.warn('Steps already created! Destroying existing.')
            this.steps.forEach((step) => step.destroy())
        }

        this.steps = []

        let steps = getExecutionSteps(this.execution)

        for (let i = 0; i < steps.length; i++) {
            const action = new Action(steps[i], this)
            this.steps.push(action)
        }

        this.state.isShowingSteps = true
        this.update()
    }

    destroySteps() {
        this.steps.forEach((step) => step.destroy())
        this.steps = []

        this.state.isShowingSteps = false

        this.update()
    }

    /* ----------------------- Update ----------------------- */

    update() {
        this.renderer.update()
        Executor.instance.visualization.mapping?.updateProxies()
        const program = Executor.instance.visualization.program
        Executor.instance.visualization.view?.setFrames(
            program.representation.getFrames(),
            program.execution.precondition
        )
    }

    removeStep(step: Action) {
        const index = this.steps.indexOf(step)
        if (index > -1) {
            this.steps.splice(index, 1)
        } else {
            console.warn('Step not found!')
        }
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        this.renderer.destroy()
        this.renderer = null

        this.steps.forEach((step) => step.destroy())
        this.steps = null

        this.representation.destroy()
        this.representation = null

        delete Action.all[this.state.id]

        this.state = null
        this.parent = null
        this.execution = null
    }
}
