import { AnimationGraph, duration } from '../animation/animation'
import { AbstractionSelection } from '../execution/graph/abstraction/Abstractor'
import { createTransition } from '../execution/graph/abstraction/Transition'
import { ExecutionGraph } from '../execution/graph/ExecutionGraph'
import { ExecutionNode, instanceOfExecutionNode } from '../execution/primitive/ExecutionNode'
import { Executor } from '../executor/Executor'
import { createViewController, CreateViewOptions, createViewRenderer } from '../utilities/view'
import { Timeline } from './Timeline/Timeline'
import { ViewController } from './ViewController'
import { ViewRenderer } from './ViewRenderer'
import { createViewState, ViewState } from './ViewState'

export class View {
    // State
    state: ViewState
    renderer: ViewRenderer
    controller: ViewController

    // Timeline
    stepsTimeline: Timeline

    // Original animation, only used to derive compiled animation
    originalAnimation: ExecutionGraph | ExecutionNode

    // Transition animation, used when this view's steps are not shown
    transitionAnimation: AnimationGraph

    // Timeline
    // timeline: Timeline

    isRoot: boolean = false

    constructor(originalAnimation: ExecutionGraph | ExecutionNode, options: CreateViewOptions) {
        let start = performance.now()
        // Initial state
        this.state = createViewState()

        // Setup animations
        this.originalAnimation = originalAnimation
        this.transitionAnimation = createTransition(originalAnimation)
        console.log('Setup animations:', performance.now() - start, 'ms')
        start = performance.now()

        // Setup renderer
        this.renderer = createViewRenderer(this)
        console.log('Setup renderer:', performance.now() - start, 'ms')
        start = performance.now()

        // Setup controller
        this.controller = createViewController(this)
        console.log('Setup controller:', performance.now() - start, 'ms')
        start = performance.now()

        if (options.expand) {
            this.controller.expand()
        }

        console.log('Expand:', performance.now() - start, 'ms')
        start = performance.now()

        if (options.isRoot) {
            this.isRoot = true
        }
    }

    tick(dt: number) {
        this.controller.tick(dt)
        this.renderer.tick(dt)
        this.stepsTimeline?.tick(dt)
    }

    getDuration() {
        if (this.state.isShowingSteps) {
            return this.stepsTimeline.getDuration()
        } else {
            return duration(this.transitionAnimation)
        }
    }

    getAbstractionSelection(): AbstractionSelection {
        if (!this.state.isShowingSteps || instanceOfExecutionNode(this.originalAnimation)) {
            return {
                id: this.originalAnimation.id,
                selection: null,
            }
        }

        return this.stepsTimeline.getAbstractionSelection(this.originalAnimation.id)
    }

    destroy() {
        this.renderer.destroy()
        this.stepsTimeline?.destroy()

        Executor.instance.rootView.removeView(this)

        this.renderer = null
        this.stepsTimeline = null
        this.controller = null
    }
}
