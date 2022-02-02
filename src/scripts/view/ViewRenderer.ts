import { instanceOfAnimationNode } from '../animation/primitive/AnimationNode'
import { AnimationRenderer } from '../environment/AnimationRenderer'
import { getNumericalValueOfStyle, lerp } from '../utilities/math'
import { View } from './View'

export class ViewRenderer {
    view: View

    // Rendering
    element: HTMLDivElement
    header: HTMLDivElement
    label: HTMLDivElement

    // Steps
    stepsContainer: HTMLDivElement

    // Control elements
    controlElement: HTMLDivElement
    stepsToggle: HTMLDivElement
    hardStepsToggle: HTMLDivElement
    collapseToggle: HTMLDivElement

    // Body
    viewBody: HTMLDivElement

    // Animation
    animationRenderer: AnimationRenderer

    constructor(view: View) {
        this.view = view

        // Element
        this.element = document.createElement('div')
        this.element.classList.add('view')
        this.element.classList.add('collapsed')

        // Header
        this.header = document.createElement('div')
        this.header.classList.add('view-header')
        this.element.appendChild(this.header)

        this.label = document.createElement('div')
        this.label.classList.add('view-label')
        this.header.appendChild(this.label)

        this.stepsContainer = document.createElement('div')
        this.stepsContainer.classList.add('view-steps-container')
        this.element.appendChild(this.stepsContainer)

        // Animation
        document.body.appendChild(this.element)

        this.label.innerHTML = (
            instanceOfAnimationNode(view.originalAnimation)
                ? view.originalAnimation.name
                : view.originalAnimation.nodeData.type
        )
            .replace(/([A-Z])/g, ' $1')
            .trim()

        this.setupControls()
        this.setupConnection()

        // Body
        this.viewBody = document.createElement('div')
        this.viewBody.classList.add('view-body')
        this.element.appendChild(this.viewBody)
    }

    setupConnection() {
        this.startNode = document.createElement('div')
        this.startNode.classList.add('view-start-node')
        document.body.appendChild(this.startNode)

        this.endNode = document.createElement('div')
        this.endNode.classList.add('view-end-node')
        this.element.appendChild(this.endNode)

        // The connection path
        this.connection = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
        )
        this.connection.classList.add('connection-path')

        // Add them to global svg canvas
        const svg = document.getElementById('svg-canvas')
        svg.append(this.connection)
    }

    setupControls() {
        this.controlElement = document.createElement('div')
        this.controlElement.classList.add('view-controls')
        this.element.appendChild(this.controlElement)

        this.setupStepsToggle()
        this.setupCollapseToggle()
        this.setupHardStepsToggle()
    }

    setupInPlaceStepsToggle() {
        this.stepsToggle = document.createElement('div')
        this.stepsToggle.classList.add('view-control-button')
        this.stepsToggle.innerHTML = '<ion-icon name="albums"></ion-icon>'
        this.header.appendChild(this.stepsToggle)
    }

    setupStepsToggle() {
        this.stepsToggle = document.createElement('div')
        this.stepsToggle.classList.add('view-control-button')
        this.stepsToggle.innerHTML = '<ion-icon name="albums"></ion-icon>'
        this.header.appendChild(this.stepsToggle)
    }

    setupHardStepsToggle() {
        this.hardStepsToggle = document.createElement('div')
        this.hardStepsToggle.classList.add('view-control-button')
        this.hardStepsToggle.innerHTML =
            '<ion-icon name="chevron-forward"></ion-icon>'
        this.header.appendChild(this.hardStepsToggle)
    }

    setupCollapseToggle() {
        this.collapseToggle = document.createElement('div')
        this.collapseToggle.classList.add('view-control-button')
        this.collapseToggle.innerHTML = '<ion-icon name="add"></ion-icon>'
        this.header.appendChild(this.collapseToggle)
    }

    updateConnection() {
        // const start = this.startNode.getBoundingClientRect()
        // let end: DOMRect
        // end = this.endNode.getBoundingClientRect()
        // // Arrow
        // const arrow = getBoxToBoxArrow(
        //     start.x,
        //     start.y,
        //     start.width,
        //     start.height,
        //     end.x,
        //     end.y,
        //     end.width,
        //     end.height,
        //     { padEnd: 0, padStart: 0 }
        // )
        // const [sx, sy, c1x, c1y, c2x, c2y, ex, ey, ae] = arrow
        // this.connection.setAttribute(
        //     'd',
        //     `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`
        // )
    }

    updatePosition() {
        let t = 0.2

        // Update left
        const left = lerp(
            getNumericalValueOfStyle(this.element.style.left),
            this.view.state.transform.position.x,
            t
        )

        // Update right
        const top = lerp(
            getNumericalValueOfStyle(this.element.style.top),
            this.view.state.transform.position.y,
            t
        )

        // Update top
        this.element.style.left = `${left}px`
        this.element.style.top = `${top}px`

        this.updateConnection()
    }

    tick(dt: number) {
        this.updatePosition()

        // Update animation
        // TODO: Make this part of an animation layer
        this.updateEndNode()
        this.updateStartNode()
    }

    updateEndNode() {
        let x = 0,
            y = 0,
            width = 0,
            height = 0
        if (this.view.state.isShowingSteps) {
            const bbox = this.element.getBoundingClientRect()
            x = -8
            y = 13
            width = 3
            height = bbox.height
        } else {
            x = -9
            y = 13
            width = 5
            height = 5
        }

        this.endNode.style.left = `${x}px`
        this.endNode.style.top = `${y}px`
        this.endNode.style.width = `${width}px`
        this.endNode.style.height = `${height}px`
    }

    updateStartNode() {}

    destroy() {
        this.element.remove()

        this.startNode.remove()
        this.endNode.remove()
        this.connection.remove()
    }
}
