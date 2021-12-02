import { AnimationGraph } from '../../animation/graph/AnimationGraph'
import { AnimationNode } from '../../animation/primitive/AnimationNode'
import { Editor } from '../../editor/Editor'
import { AbstractionControls } from './AbstractionControls'

export class AbstractionIndicator {
    element: HTMLDivElement
    controls: AbstractionControls

    constructor() {
        this.element = document.createElement('div')
        this.element.classList.add('abstraction-indicator')

        document.body.appendChild(this.element)

        this.element.addEventListener('mouseover', this.mouseover)
        this.element.addEventListener('mouseout', this.mouseout)

        this.controls = new AbstractionControls(this)
    }

    setState(chunk: AnimationGraph | AnimationNode) {
        const loc = chunk.nodeData.location
        const bbox = Editor.instance.computeBoundingBoxForLoc(loc)

        this.element.style.left = `${bbox.x}px`
        this.element.style.top = `${bbox.y}px`
        this.element.style.width = `${bbox.width}px`
        this.element.style.height = `${bbox.height}px`

        this.controls.setState(chunk)
    }

    mouseover() {
        this.controls.show()
    }

    mouseout() {}

    destroy() {
        this.element.remove()
        this.controls.destroy()
        this.controls = null
    }
}
