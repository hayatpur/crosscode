import { duration } from '../animation/animation'
import { AbstractionSelection } from '../animation/graph/abstraction/Abstractor'
import { createTransition } from '../animation/graph/abstraction/Transition'
import { AnimationGraph } from '../animation/graph/AnimationGraph'
import {
    AnimationNode,
    instanceOfAnimationNode,
} from '../animation/primitive/AnimationNode'
import { Executor } from '../executor/Executor'
import { clone } from '../utilities/objects'
import { createViewController, createViewRenderer } from '../utilities/view'
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
    originalAnimation: AnimationGraph | AnimationNode

    // Transition animation, used when this view's steps are not shown
    transitionAnimation: AnimationGraph | AnimationNode

    // Timeline
    // timeline: Timeline

    constructor(originalAnimation: AnimationGraph | AnimationNode) {
        Executor.instance.view.addView(this)

        // Initial state
        this.state = createViewState()

        // Setup animations
        this.originalAnimation = originalAnimation
        this.transitionAnimation = createTransition(clone(originalAnimation))

        // Setup renderer
        this.renderer = createViewRenderer(this)

        // Setup controller
        this.controller = createViewController(this)

        // Setup timeline
        // this.timeline = new Timeline(this)
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
        if (
            !this.state.isShowingSteps ||
            instanceOfAnimationNode(this.originalAnimation)
        ) {
            return {
                id: this.originalAnimation.id,
                selection: null,
            }
        }

        return this.stepsTimeline.getAbstractionSelection(
            this.originalAnimation.id
        )
    }

    destroy() {
        this.renderer.destroy()
        // this.timeline.destroy()
    }
}
