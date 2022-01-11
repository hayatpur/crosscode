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
import { Timeline } from './Timeline'
import { ViewController } from './ViewController'
import { ViewRenderer } from './ViewRenderer'
import { createViewState, ViewState } from './ViewState'

export class View {
    // State
    state: ViewState
    renderer: ViewRenderer
    controller: ViewController

    // Steps
    steps: View[] = []

    // Original animation, only used to derive compiled animation
    originalAnimation: AnimationGraph | AnimationNode

    // Transition animation, used when this view's steps are not shown
    transitionAnimation: AnimationGraph | AnimationNode

    // Timeline
    timeline: Timeline

    constructor(originalAnimation: AnimationGraph | AnimationNode) {
        Executor.instance.view.addView(this)

        // Initial state
        this.state = createViewState()

        // Setup animations
        this.originalAnimation = originalAnimation
        this.transitionAnimation = createTransition(clone(originalAnimation))

        // Setup renderer
        this.renderer = new ViewRenderer(this)

        // Setup controller
        this.controller = new ViewController(this)

        // Setup timeline
        this.timeline = new Timeline(this)
    }

    tick(dt: number) {
        this.controller.tick(dt)
        this.renderer.tick(dt)

        this.timeline.tick(dt)
    }

    getDuration() {
        if (this.getAbstractionSelection().selection == null) {
            return duration(this.transitionAnimation)
        } else {
            let duration = 0
            for (const step of this.steps) {
                duration += step.getDuration()
            }
            return duration
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

        const selection: AbstractionSelection = {
            id: this.originalAnimation.id,
            selection: [],
        }

        for (const step of this.steps) {
            selection.selection.push(step.getAbstractionSelection())
        }

        return selection
    }

    destroy() {}
}
