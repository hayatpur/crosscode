import {
    begin,
    createAnimationGraph,
    duration,
    end,
    instanceOfAnimationNode,
    reset,
    seek,
} from '../../animation/animation'
import { getExecutionChildren, reads, writes } from '../../execution/execution'
import { createTransition } from '../../execution/graph/abstraction/Transition'
import { instanceOfExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { instanceOfExecutionNode } from '../../execution/primitive/ExecutionNode'
import { clone } from '../../utilities/objects'
import { View } from '../View'
import { AnimationPlayerRenderer } from './AnimationPlayerRenderer'

export class AnimationPlayer {
    // Animation time
    time: number = 0
    speed: number = 1 / 128
    isPaused: boolean = true
    hasEnded: boolean = false

    view: View
    renderer: AnimationPlayerRenderer

    isMouseIn = false

    constructor(view: View) {
        this.view = view

        const execution = this.view.originalExecution

        if (this.view.transitionAnimation == null) {
            this.view.transitionAnimation = createAnimationGraph()

            const ws = writes(execution).map((w) => w.id)
            const rs = reads(execution)
                .map((r) => r.id)
                .filter((id) => !id.includes('BindFunctionNew'))

            const representation = {
                reads: rs,
                writes: ws,
            }

            if (instanceOfExecutionGraph(execution)) {
                for (const vertex of getExecutionChildren(execution)) {
                    const vertexAnimation = createTransition(vertex, representation)
                    this.view.transitionAnimation.vertices.push(vertexAnimation)
                }
            } else {
                const transition = createTransition(execution, representation)
                this.view.transitionAnimation.vertices.push(transition)
            }
        }

        const animation = this.view.transitionAnimation

        // Setup renderer
        this.renderer = new AnimationPlayerRenderer(this)
        this.view.renderer.element.addEventListener('mouseenter', this.mouseenter.bind(this))
        this.view.renderer.element.addEventListener('mouseleave', this.mouseleave.bind(this))
        this.renderer.show()

        // Setup animation controls
        // if (instanceOfExecutionGraph(execution)) {
        let start = 0
        const executionVertices = instanceOfExecutionNode(execution)
            ? [execution]
            : getExecutionChildren(execution)

        const animationVertices = instanceOfAnimationNode(animation)
            ? [animation]
            : animation.vertices

        for (let i = 0; i < executionVertices.length; i++) {
            let t = start
            const view = this.renderer.events[executionVertices[i].id]
            view.renderer.viewBody.addEventListener('mouseenter', () => {
                if (this.hasEnded) {
                    reset(this.view.transitionAnimation)
                    this.hasEnded = false
                }
                this.isPaused = false
                this.time = t
            })
            start += duration(animation.vertices[i])
        }
        // }
    }

    mouseenter(e: MouseEvent) {
        this.isMouseIn = true
    }

    mouseleave(e: MouseEvent) {
        this.isMouseIn = false
    }

    tick(dt: number) {
        const execution = this.view.originalExecution
        const animation = this.view.transitionAnimation

        const executionVertices = instanceOfExecutionNode(execution)
            ? [execution]
            : getExecutionChildren(execution)

        const animationVertices = instanceOfAnimationNode(animation)
            ? [animation]
            : animation.vertices

        for (let i = 0; i < executionVertices.length; i++) {
            const view = this.renderer.events[executionVertices[i].id]
            const anim = animationVertices[i]

            if (anim.isPlaying) {
                view.renderer.element.classList.add('playing')
            } else {
                view.renderer.element.classList.remove('playing')
            }
        }

        if (this.isPaused) {
            return
        }

        const animationRenderer = this.view.renderer.animationRenderer
        if (animationRenderer == null) {
            console.warn('Trying to render animation without an animation renderer', this.view.id)
            return
        }

        this.time += dt * this.speed

        // Seek into animation
        if (this.time > duration(this.view.transitionAnimation)) {
            if (!this.view.transitionAnimation.hasPlayed) {
                end(this.view.transitionAnimation, animationRenderer.environment)
                this.view.transitionAnimation.hasPlayed = true
                this.view.transitionAnimation.isPlaying = false
            }
            this.hasEnded = true
            // this.time = 0
            // reset(this.view.transitionAnimation)
            // animationRenderer.environment = clone(this.view.originalExecution.precondition)
        } else if (!this.isPaused) {
            seek(this.view.transitionAnimation, animationRenderer.environment, this.time)
            this.time += dt * this.speed
        }

        this.renderer.tick(dt)

        animationRenderer.update()
    }

    restart() {
        const animationRenderer = this.view.renderer.animationRenderer
        if (animationRenderer == null) {
            console.warn('Trying to restart animation without an animation renderer')
            return
        }

        this.isPaused = false
        this.time = 0
        this.hasEnded = false
        reset(this.view.transitionAnimation)
        begin(this.view.transitionAnimation, animationRenderer.environment)
    }

    start() {
        this.isPaused = false
    }

    pause() {
        this.isPaused = true
    }

    destroy() {
        const animationRenderer = this.view.renderer.animationRenderer
        if (animationRenderer == null) {
            console.warn('Trying to destroy animation without an animation renderer')
            return
        }

        reset(this.view.transitionAnimation)
        const renderer = animationRenderer.environment.renderer
        animationRenderer.environment = clone(this.view.originalExecution.postcondition)
        animationRenderer.environment.renderer = renderer

        this.renderer?.destroy()
    }
}
