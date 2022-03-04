import { instanceOfAnimationNode } from '../../animation/animation'
import { instanceOfExecutionNode } from '../../execution/primitive/ExecutionNode'
import { Executor } from '../../executor/Executor'
import { View } from '../View'
import { AnimationPlayer } from './AnimationPlayer'

export class AnimationPlayerRenderer {
    element: HTMLElement // Whole element
    timelineElement: HTMLElement

    events: { [key: string]: View } = {}
    player: AnimationPlayer

    isShowing = false

    constructor(player: AnimationPlayer) {
        this.player = player

        this.element = document.createElement('div')
        this.element.classList.add('animation-player')

        this.timelineElement = document.createElement('div')
        this.timelineElement.classList.add('animation-player-timeline')
        this.element.appendChild(this.timelineElement)
    }

    show() {
        const execution = this.player.view.originalExecution
        const animation = this.player.view.transitionAnimation

        const executionVertices = instanceOfExecutionNode(execution)
            ? [execution]
            : execution.vertices

        const animationVertices = instanceOfAnimationNode(animation)
            ? [animation]
            : animation.vertices

        for (let i = 0; i < executionVertices.length; i++) {
            const view = Executor.instance.rootView.createView(executionVertices[i], {
                expand: false,
                embedded: true,
            })
            this.events[executionVertices[i].id] = view

            this.timelineElement.appendChild(view.renderer.element)
        }

        this.player.view.renderer.viewBody.classList.add('showing-timeline')
        this.player.view.renderer.viewBody.append(this.element)

        this.isShowing = true
    }

    hide() {
        for (const event of Object.values(this.events)) {
            event.destroy()
        }

        this.events = {}

        this.player.view.renderer.viewBody.classList.remove('showing-timeline')
        this.element.remove()

        this.isShowing = false
    }

    tick(dt: number) {
        for (const event of Object.values(this.events)) {
            event.tick(dt)
        }
    }

    destroy() {
        this.hide()
        this.element.remove()
    }
}
