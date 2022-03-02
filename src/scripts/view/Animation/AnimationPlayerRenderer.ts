import { instanceOfExecutionNode } from '../../execution/primitive/ExecutionNode'
import { AnimationPlayer } from './AnimationPlayer'

export class AnimationPlayerRenderer {
    element: HTMLElement // Whole element
    timelineElement: HTMLElement

    events: { [key: string]: HTMLElement } = {}
    player: AnimationPlayer

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

        if (instanceOfExecutionNode(execution)) {
            console.warn("Can't show animation player for animation node")
            return
        }

        for (const event of execution.vertices) {
            const element = document.createElement('div')
            element.classList.add('animation-player-event')
            this.timelineElement.appendChild(element)
            this.events[event.id] = element
        }

        this.player.view.renderer.viewBody.classList.add('showing-timeline')
        this.player.view.renderer.viewBody.append(this.element)
    }

    hide() {
        for (const event of Object.values(this.events)) {
            event.remove()
        }

        this.events = {}

        this.player.view.renderer.viewBody.classList.remove('showing-timeline')
        this.element.remove()
    }

    destroy() {
        this.element.remove()
    }
}
