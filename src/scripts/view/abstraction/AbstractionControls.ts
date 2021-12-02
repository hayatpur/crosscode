import { AnimationGraph } from '../../animation/graph/AnimationGraph'
import { AnimationNode } from '../../animation/primitive/AnimationNode'
import { AbstractionIndicator } from './AbstractionIndicator'

export class AbstractionControls {
    element: HTMLDivElement

    // Buttons
    increaseAbstraction: HTMLDivElement
    decreaseAbstraction: HTMLDivElement

    indicator: AbstractionIndicator

    constructor(indicator: AbstractionIndicator) {
        this.indicator = indicator

        this.element = document.createElement('div')
        this.element.classList.add('abstraction-controls')
        this.element.classList.add('hidden')

        this.increaseAbstraction = document.createElement('div')
        this.increaseAbstraction.classList.add('button')
        this.increaseAbstraction.innerHTML = 'UP'

        this.decreaseAbstraction = document.createElement('div')
        this.decreaseAbstraction.classList.add('button')
        this.decreaseAbstraction.innerHTML = 'DN'

        this.element.appendChild(this.increaseAbstraction)
        this.element.appendChild(this.decreaseAbstraction)
    }

    setState(chunk: AnimationGraph | AnimationNode) {}

    hide() {
        this.element.classList.add('hidden')
    }

    show() {
        this.element.classList.remove('hidden')
    }

    destroy() {
        this.element.remove()
    }
}
