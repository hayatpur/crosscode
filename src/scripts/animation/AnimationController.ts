import { Editor } from '../editor/Editor'
import { View } from '../view/View'
import { AnimationGraph } from './graph/AnimationGraph'
import { AnimationNode } from './primitive/AnimationNode'

export class AnimationController {
    static instance: AnimationController

    animation: AnimationGraph
    element: HTMLUListElement

    hoverBoundary: HTMLDivElement

    elMapping: { [key: string]: HTMLDivElement } = {}

    destroy() {
        Object.values(this.elMapping).forEach((element) => element.remove())
        this.hoverBoundary.remove()
        this.element.remove()

        this.animation = undefined
        this.element = undefined
        this.hoverBoundary = undefined
        this.elMapping = undefined

        AnimationController.instance = undefined
    }

    constructor(animation: AnimationGraph) {
        AnimationController.instance = this
        this.animation = animation

        this.element = document.createElement('ul')
        this.element.classList.add('animation-controller-list', 'root')

        document.body.append(this.element)
        this.create(this.animation, this.element)

        this.hoverBoundary = document.createElement('div')
        this.hoverBoundary.classList.add('hover-boundary')
        document.body.append(this.hoverBoundary)
    }

    click(e: MouseEvent, animation: AnimationGraph | AnimationNode) {}

    highlight(animation: AnimationGraph | AnimationNode) {
        // console.log(animation)
        let loc = animation instanceof AnimationNode ? animation.statement.loc : animation.node.loc
        // console.log(loc)

        const start = Editor.instance.computeBoundingBox(loc.start.line)
        let charWidth = Editor.instance.computeCharWidth(loc.start.line)

        start.y -= 5
        start.height += 10
        start.x += charWidth * loc.start.column
        start.width = charWidth * (loc.end.column - loc.start.column)

        this.hoverBoundary.style.width = `${start.width}px`
        this.hoverBoundary.style.height = `${start.height}px`
        this.hoverBoundary.style.left = `${start.left}px`
        this.hoverBoundary.style.top = `${start.top}px`

        document.querySelectorAll('.animation-controller-label').forEach((el) => el.classList.remove('hovered'))
        this.elMapping[animation.id].classList.add('hovered')
    }

    mouseenter(e: MouseEvent, animation: AnimationGraph | AnimationNode) {
        this.highlight(animation)

        if (animation instanceof AnimationGraph && animation.precondition != null) {
            View.views.forEach((view) => {
                view.environment = animation.precondition
                view.update()
            })
        }
    }

    mouseleave(e: MouseEvent, animation: AnimationGraph | AnimationNode) {
        this.hoverBoundary.style.width = `${0}px`
        this.hoverBoundary.style.height = `${0}px`
    }

    create(animation: AnimationGraph | AnimationNode, parent: HTMLElement) {
        const element = document.createElement('li')
        element.classList.add('animation-controller-item')
        const label = document.createElement('div')

        this.elMapping[animation.id] = label

        if (animation instanceof AnimationGraph) {
            label.innerHTML = `[${animation.id}] ${animation.node.constructor.name}`
        } else {
            label.innerHTML = `[${animation.id}] ${animation.constructor.name}`
        }
        label.classList.add('animation-controller-label')

        label.addEventListener('mouseenter', (e) => this.mouseenter(e, animation))
        label.addEventListener('mouseleave', (e) => this.mouseleave(e, animation))

        element.append(label)

        parent.append(element)

        if (animation instanceof AnimationGraph) {
            const list = document.createElement('ul')
            list.classList.add('animation-controller-list')
            element.append(list)

            animation.vertices.forEach((vertex) => this.create(vertex, list))
        }
    }
}
