import { instanceOfExecutionNode } from '../../execution/primitive/ExecutionNode'
import { AnimationPlayer } from './AnimationPlayer'
import { AnimationPlayerEvent } from './AnimationPlayerEvent'

export class AnimationPlayerRenderer {
    element: HTMLElement // Whole element
    timelineElement: HTMLElement

    events: { [key: string]: AnimationPlayerEvent } = {}
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

        if (instanceOfExecutionNode(execution)) {
            console.warn("Can't show animation player for animation node")
            return
        }

        for (let i = 0; i < execution.vertices.length; i++) {
            this.events[execution.vertices[i].id] = new AnimationPlayerEvent(
                execution.vertices[i],
                animation.vertices[i]
            )
            this.timelineElement.appendChild(this.events[execution.vertices[i].id].element)
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
