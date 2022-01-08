import { begin, duration, end, reset } from '../animation/animation'
import { AnimationGraph } from '../animation/graph/AnimationGraph'
import { AnimationNode } from '../animation/primitive/AnimationNode'
import { remap } from '../utilities/math'
import { clone } from '../utilities/objects'
import { AnimationRenderer } from './AnimationRenderer'

export class TimelineRenderer {
    // State
    time: number = 0
    paused: boolean = false
    speed: number = 1 / 48

    disabled: boolean = false

    animation: AnimationGraph | AnimationNode
    animationRenderer: AnimationRenderer

    // Rendering
    element: HTMLDivElement = null

    timelineBar: HTMLDivElement = null
    scrubber: HTMLDivElement = null

    playToggle: HTMLDivElement = null
    resetButton: HTMLDivElement = null

    constructor(
        animation: AnimationGraph | AnimationNode,
        animationRenderer: AnimationRenderer
    ) {
        this.element = document.createElement('div')
        this.element.classList.add('timeline')

        this.playToggle = document.createElement('div')
        this.playToggle.classList.add('timeline-button')
        this.playToggle.innerHTML = '<ion-icon name="pause"></ion-icon>'
        this.element.appendChild(this.playToggle)

        this.resetButton = document.createElement('div')
        this.resetButton.classList.add('timeline-button')
        this.resetButton.innerHTML = '<ion-icon name="refresh"></ion-icon>'
        this.element.appendChild(this.resetButton)

        this.timelineBar = document.createElement('div')
        this.timelineBar.classList.add('timeline-bar')
        this.element.appendChild(this.timelineBar)

        this.scrubber = document.createElement('div')
        this.scrubber.classList.add('timeline-scrubber')
        this.timelineBar.appendChild(this.scrubber)

        this.animation = animation
        this.animationRenderer = animationRenderer

        // Setup bindings
        this.playToggle.addEventListener('click', () => {
            this.paused = !this.paused

            if (this.paused) {
                this.playToggle.innerHTML = '<ion-icon name="play"></ion-icon>'
            } else {
                this.playToggle.innerHTML = '<ion-icon name="pause"></ion-icon>'
            }
        })

        this.resetButton.addEventListener('click', () => {
            reset(this.animation)
            this.time = 0

            this.animationRenderer.environment = clone(
                this.animation.precondition
            )
            this.animationRenderer.paths = {}
        })

        begin(this.animation, this.animationRenderer.environment)
        this.animation.isPlaying = true
    }

    destroy() {
        this.element.remove()
    }

    enable() {
        this.element.classList.remove('disabled')
        this.disabled = false
    }

    disable() {
        this.element.classList.add('disabled')
        this.disabled = true
    }

    tick(dt: number) {
        if (this.time >= duration(this.animation)) {
            if (this.animation.isPlaying) {
                end(this.animation, this.animationRenderer.environment)
                this.animation.isPlaying = false
            }

            // this.animationRenderer.showingFinalRenderers = true
        } else {
            this.animationRenderer.seek(this.time)
            if (!this.paused) this.time += dt * this.speed
        }

        const bbox = this.timelineBar.getBoundingClientRect()

        // Move scrubber over
        const x = remap(
            this.time,
            0,
            duration(this.animation),
            0,
            bbox.width - 5
        )
        this.scrubber.style.left = `${x}px`
    }

    updateAnimation(animation: AnimationGraph | AnimationNode) {
        this.animation = animation

        // Loop
        this.time = 0
        reset(this.animation)

        this.animationRenderer.updateAnimation(animation)

        begin(this.animation, this.animationRenderer.environment)
        this.animation.isPlaying = true
    }
}
