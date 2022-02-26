import { begin, duration, end, reset, seek } from '../../animation/animation'
import { createTransition } from '../../execution/graph/abstraction/Transition'
import { clone } from '../../utilities/objects'
import { View } from '../View'

export class AnimationPlayer {
    // Animation time
    time: number = 0
    speed: number = 1 / 256
    isPaused: boolean = true
    hasEnded: boolean = false

    view: View

    constructor(view: View) {
        this.view = view

        if (this.view.transitionAnimation == null) {
            this.view.transitionAnimation = createTransition(this.view.originalExecution)
        }
    }

    tick(dt: number) {
        if (this.isPaused) {
            return
        }

        const animationRenderer = this.view.renderer.animationRenderer
        if (animationRenderer == null) {
            console.warn('Trying to render animation without an animation renderer')
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
    }
}
