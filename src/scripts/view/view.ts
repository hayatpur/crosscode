import { AnimationGraph } from '../animation/animation'
import { AbstractionSelection } from '../execution/graph/abstraction/Abstractor'
import { ExecutionGraph } from '../execution/graph/ExecutionGraph'
import { ExecutionNode, instanceOfExecutionNode } from '../execution/primitive/ExecutionNode'
import { Executor } from '../executor/Executor'
import { createViewController, CreateViewOptions, createViewRenderer } from '../utilities/view'
import { AnimationPlayer } from './Animation/AnimationPlayer'
import { Timeline } from './Timeline/Timeline'
import { ViewController } from './ViewController'
import { ViewRenderer } from './ViewRenderer'
import { createViewState, ViewState } from './ViewState'

let _VIEW_ID = 0
export class View {
    // State
    state: ViewState
    renderer: ViewRenderer
    controller: ViewController

    // Timeline
    stepsTimeline: Timeline

    // Original animation, only used to derive compiled animation
    originalExecution: ExecutionGraph | ExecutionNode

    // Transition animation, used when this view's steps are not shown
    transitionAnimation: AnimationGraph

    animationPlayer: AnimationPlayer

    // Timeline
    // timeline: Timeline

    isRoot: boolean = false

    id: string

    constructor(originalExecution: ExecutionGraph | ExecutionNode, options: CreateViewOptions) {
        this.id = `View(${++_VIEW_ID})`

        let start = performance.now()
        // Initial state
        this.state = createViewState()

        // Setup animations
        this.originalExecution = originalExecution
        // this.transitionAnimation = createTransition(originalExecution)
        // console.log('Setup animations:', performance.now() - start, 'ms')
        // start = performance.now()

        // Setup renderer
        this.renderer = createViewRenderer(this)
        // console.log('Setup renderer:', performance.now() - start, 'ms')
        // start = performance.now()

        // Setup controller
        this.controller = createViewController(this)
        // console.log('Setup controller:', performance.now() - start, 'ms')
        // start = performance.now()

        if (options.embedded) {
            this.controller.makeEmbedded()
        } else {
            this.controller.makeNotEmbedded()
        }

        if (options.expand) {
            this.controller.expand()
        }

        if (options.temporary) {
            this.controller.makeTemporary()
        }

        // console.log('Expand:', performance.now() - start, 'ms')
        // start = performance.now()

        if (options.isRoot) {
            this.isRoot = true
        }
    }

    tick(dt: number) {
        this.controller.tick(dt)
        this.renderer.tick(dt)
        this.stepsTimeline?.tick(dt)
    }

    // getDuration() {
    //     if (this.state.isShowingSteps) {
    //         return this.stepsTimeline.getDuration()
    //     } else {
    //         return duration(this.transitionAnimation)
    //     }
    // }

    getAbstractionSelection(): AbstractionSelection {
        if (!this.state.isShowingSteps || instanceOfExecutionNode(this.originalExecution)) {
            return {
                id: this.originalExecution.id,
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
