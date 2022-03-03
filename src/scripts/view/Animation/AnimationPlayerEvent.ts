import { AnimationGraph, AnimationNode } from '../../animation/animation'
import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
import { View } from '../View'

export class AnimationPlayerEvent {
    element: HTMLElement
    execution: ExecutionNode | ExecutionGraph
    animation: AnimationNode | AnimationGraph

    isPlaying: boolean = false
    isHovered: boolean = false

    tempView: View

    constructor(
        execution: ExecutionNode | ExecutionGraph,
        animation: AnimationNode | AnimationGraph
    ) {
        this.execution = execution
        this.animation = animation

        this.element = document.createElement('div')
        this.element.classList.add('animation-player-event')

        this.element.addEventListener('mouseenter', () => {
            this.isHovered = true
        })
        this.element.addEventListener('mouseleave', () => {
            this.isHovered = false
        })

        // this.tempView = new View(this.execution, {
        //     expand: false,
        // })

        // this.element = this.tempView.renderer.element

        // const label = this.tempView.renderer.label
        // label.classList.add('animation-player-event')

        // label.addEventListener('mouseenter', () => {
        //     this.isHovered = true
        // })
        // label.addEventListener('mouseleave', () => {
        //     this.isHovered = false
        // })

        // label.innerHTML = ''
        // this.tempView.renderer.preLabel.innerHTML = ''

        // this.temporaryCodeQuery = Executor.instance.rootView.createCodeQuery({
        //     view: this.tempView,
        //     type: ViewSelectionType.CodeToView,
        // })
    }

    tick(dt: number) {
        if ((this.animation.isPlaying || this.isHovered) && !this.isPlaying) {
            this.isPlaying = true
            this.activate()
        } else if (!this.animation.isPlaying && !this.isHovered && this.isPlaying) {
            this.isPlaying = false
            this.deactivate()
        }
    }

    activate() {
        this.element.classList.add('playing')
        // this.temporaryCodeQuery.select()
    }

    deactivate() {
        this.element.classList.remove('playing')
        // this.temporaryCodeQuery.deselect()
    }

    destroy() {
        // this.element.remove()
        // this.temporaryCodeQuery.destroy()
        // this.tempView.destroy()
    }
}
