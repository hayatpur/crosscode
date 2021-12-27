import { queryAnimationGraph } from '../animation/graph/graph'
import { instanceOfAnimationNode } from '../animation/primitive/AnimationNode'
import { Executor } from '../executor/Executor'

export class ViewConnection {
    origin: HTMLDivElement
    originLabel: HTMLDivElement
    originButton: HTMLDivElement

    destination: HTMLDivElement

    connection: SVGPathElement

    constructor(animationId: string) {
        // Create origin
        this.origin = document.createElement('div')
        this.origin.classList.add('view-connection-origin')

        this.originLabel = document.createElement('div')
        this.originLabel.classList.add('view-connection-origin-label')
        this.origin.appendChild(this.originLabel)

        this.originButton = document.createElement('div')
        this.originButton.classList.add('view-connection-origin-button')
        this.origin.appendChild(this.originButton)

        this.connection = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
        )
        // this.element.appendChild(this.connection)

        // Initial position
        const animation = queryAnimationGraph(
            Executor.instance.animation,
            (node) => node.id == animationId
        )

        if (animation == null) return

        this.originLabel.innerHTML = (
            instanceOfAnimationNode(animation)
                ? animation.name
                : animation.nodeData.type
        )
            .replace(/([A-Z])/g, ' $1')
            .trim()
    }
}
