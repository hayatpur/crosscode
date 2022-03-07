import { AbstractionSelection } from '../../execution/graph/abstraction/Abstractor'
import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode, instanceOfExecutionNode } from '../../execution/primitive/ExecutionNode'
import { Executor } from '../../executor/Executor'
import { Timeline } from '../Timeline/Timeline'
import { ActionController } from './ActionController'
import { ActionRenderer } from './ActionRenderer'
import { ActionState, createActionState } from './ActionState'

export interface CreateActionOptions {
    shouldExpand?: boolean
    depth?: number
}

export class Action {
    // Corresponding execution
    execution: ExecutionGraph | ExecutionNode

    // State
    state: ActionState

    // Renderer
    renderer: ActionRenderer

    // Controller
    controller: ActionController

    // Timeline
    timeline: Timeline

    constructor(execution: ExecutionGraph | ExecutionNode, options: CreateActionOptions) {
        // Initialize state
        this.state = createActionState()

        // Initialize renderer
        this.renderer = new ActionRenderer()

        // Initialize controller
        this.controller = new ActionController(this)

        // Setup animations
        this.execution = execution
    }

    tick(dt: number) {}

    getAbstractionSelection(): AbstractionSelection {
        if (!this.state.isShowingSteps || instanceOfExecutionNode(this.execution)) {
            return {
                id: this.execution.id,
                selection: null,
            }
        }

        return this.stepsTimeline.getAbstractionSelection(this.originalExecution.id)
    }

    getDepth(): number {
        if (!this.state.isShowingSteps) {
            return 1
        } else {
            return 1 + Math.max(...this.stepsTimeline.views.map((v) => v.getDepth()))
        }
    }

    destroy() {
        this.renderer.destroy()
        this.stepsTimeline?.destroy()
        this.controller.temporaryCodeQuery?.destroy()
        this.controller.hideTrace()

        this.animationPlayer?.destroy()

        Executor.instance.rootView.removeView(this)

        this.renderer = null
        this.stepsTimeline = null
        this.controller = null
    }
}
