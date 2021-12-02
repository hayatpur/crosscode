import { AnimationGraph } from '../animation/graph/AnimationGraph'
import { AnimationNode } from '../animation/primitive/AnimationNode'
import { Editor } from '../editor/Editor'

export class AbstractionIndicator {
    element: HTMLDivElement

    constructor() {
        this.element = document.createElement('div')
        this.element.classList.add('abstraction-indicator')

        document.body.appendChild(this.element)
    }

    setState(chunk: AnimationGraph | AnimationNode) {
        const loc = chunk.nodeData.location
        const bbox = Editor.instance.computeBoundingBoxForLoc(loc)

        this.element.style.left = `${bbox.x}px`
        this.element.style.top = `${bbox.y}px`
        this.element.style.width = `${bbox.width}px`
        this.element.style.height = `${bbox.height}px`
    }

    destroy() {
        this.element.remove()
    }
}
