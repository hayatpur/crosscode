import { AnimationGraph } from '../../animation/graph/AnimationGraph'
import { AnimationNode } from '../../animation/primitive/AnimationNode'
import { Executor } from '../../executor/Executor'
import { Ticker } from '../../utilities/Ticker'
import { AbstractionIndicator } from './AbstractionIndicator'

export class AbstractionControls {
    element: HTMLDivElement

    // Buttons
    increaseAbstraction: HTMLDivElement
    decreaseAbstraction: HTMLDivElement

    indicator: AbstractionIndicator

    tickerId: string

    chunkId: string

    constructor(indicator: AbstractionIndicator) {
        this.indicator = indicator

        this.element = document.createElement('div')
        this.element.classList.add('abstraction-controls')
        this.element.classList.add('hidden')

        this.increaseAbstraction = document.createElement('div')
        this.increaseAbstraction.classList.add('abstraction-button')
        this.increaseAbstraction.innerHTML = '<ion-icon name="arrow-up"></ion-icon>'

        this.decreaseAbstraction = document.createElement('div')
        this.decreaseAbstraction.classList.add('abstraction-button')
        this.decreaseAbstraction.innerHTML = '<ion-icon name="arrow-down"></ion-icon>'

        this.element.appendChild(this.increaseAbstraction)
        this.element.appendChild(this.decreaseAbstraction)

        this.increaseAbstraction.addEventListener('click', () => {
            Executor.instance.increaseAbstraction(this.chunkId)
        })

        this.decreaseAbstraction.addEventListener('click', () => {
            Executor.instance.decreaseAbstraction(this.chunkId)
        })
    }

    setState(chunk: AnimationGraph | AnimationNode) {
        this.chunkId = chunk.id
    }

    hide() {
        this.element.classList.add('hidden')
    }

    show() {
        this.element.classList.remove('hidden')
    }

    destroy() {
        this.element.remove()
        Ticker.instance.removeTickFrom(this.tickerId)
    }
}
