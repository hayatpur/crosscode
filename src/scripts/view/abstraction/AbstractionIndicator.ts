import { AnimationGraph } from '../../animation/graph/AnimationGraph'
import {
    AnimationNode,
    instanceOfAnimationNode,
} from '../../animation/primitive/AnimationNode'
import { Editor } from '../../editor/Editor'
import { AbstractionControls } from './AbstractionControls'

export class AbstractionIndicator {
    element: HTMLDivElement
    controls: AbstractionControls
    isChunk: boolean

    constructor(isChunk: boolean) {
        this.isChunk = isChunk
        this.element = document.createElement('div')
        this.element.classList.add('abstraction-indicator')

        document.body.appendChild(this.element)

        this.element.addEventListener('mouseover', this.mouseover.bind(this))
        this.element.addEventListener('mouseout', this.mouseout.bind(this))

        // console.log("Creating controls...")
        this.controls = new AbstractionControls(this)
        this.element.appendChild(this.controls.element)
        // console.log(this.controls);
    }

    setState(chunk: AnimationGraph | AnimationNode) {
        const loc = chunk.nodeData.location
        const bbox = Editor.instance.computeBoundingBoxForLoc(loc)

        if (instanceOfAnimationNode(chunk)) {
            this.element.classList.add('animation-node')
        } else {
            this.element.classList.remove('animation-node')
        }

        this.element.style.left = `${bbox.x - 2}px`
        this.element.style.top = `${bbox.y}px`
        this.element.style.width = `${bbox.width + 4}px`
        this.element.style.height = `${bbox.height}px`

        this.controls.setState(chunk)
    }

    mouseover() {
        this.controls.show()
    }

    mouseout() {
        this.controls.hide()
    }

    destroy() {
        this.element.remove()
        this.controls.destroy()
        this.controls = null
    }
}
