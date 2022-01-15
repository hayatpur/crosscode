import { getBoxToBoxArrow } from 'curved-arrows'
import { instanceOfAnimationNode } from '../animation/primitive/AnimationNode'
import { Editor } from '../editor/Editor'
import { AnimationRenderer } from '../environment/AnimationRenderer'
import { getNumericalValueOfStyle, lerp } from '../utilities/math'
import { View } from './View'
import { CodeAnchor } from './ViewState'

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
    collapseToggle: HTMLDivElement
    resetButton: HTMLDivElement

    // Body
    viewBody: HTMLDivElement

    // Start, end, and connection
    startNode: HTMLDivElement
    endNode: HTMLDivElement
    connection: SVGPathElement

    // Animation
    animationRenderer: AnimationRenderer

    // If anchored to another view
    viewAnchor: HTMLDivElement
    viewEndAnchor: HTMLElement

    constructor(view: View) {
        this.view = view

        // Element
        this.element = document.createElement('div')
        this.element.classList.add('view')

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

        this.setupStepsToggle()
        this.setupCollapseToggle()
        this.setupResetButton()
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

    setupStepsToggle() {
        this.stepsToggle = document.createElement('div')
        this.stepsToggle.classList.add('view-control-button')
        this.stepsToggle.innerHTML =
            '<ion-icon name="chevron-forward"></ion-icon>'
        this.header.appendChild(this.stepsToggle)
    }

    setupControls() {
        this.controlElement = document.createElement('div')
        this.controlElement.classList.add('view-controls')
        this.element.appendChild(this.controlElement)
    }

    setupCollapseToggle() {
        this.collapseToggle = document.createElement('div')
        this.collapseToggle.classList.add('view-control-button')
        this.collapseToggle.innerHTML = '<ion-icon name="add"></ion-icon>'
        this.header.appendChild(this.collapseToggle)
    }

    setupResetButton() {
        this.resetButton = document.createElement('div')
        this.resetButton.classList.add('view-control-button')
        this.resetButton.innerHTML = '<ion-icon name="refresh"></ion-icon>'
        this.header.appendChild(this.resetButton)
    }

    updateConnection() {
        const start = this.startNode.getBoundingClientRect()

        let end: DOMRect

        // if (
        //     this.view.state.isAnchored &&
        //     this.view.state.anchor._type == 'ViewAnchor'
        // ) {
        //     end = this.viewEndAnchor.getBoundingClientRect()
        // } else {
        end = this.endNode.getBoundingClientRect()
        // }

        // Arrow
        const arrow = getBoxToBoxArrow(
            start.x,
            start.y,
            start.width,
            start.height,
            end.x,
            end.y,
            end.width,
            end.height,
            { padEnd: 0, padStart: 0 }
        )

        const [sx, sy, c1x, c1y, c2x, c2y, ex, ey, ae] = arrow

        this.connection.setAttribute(
            'd',
            `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`
        )
    }

    updatePosition() {
        if (
            this.view.state.isAnchored &&
            this.view.state.anchor._type == 'ViewAnchor'
        ) {
            const endAnchorBBox =
                this.view.renderer.viewEndAnchor.getBoundingClientRect()

            this.view.state.transform.position.x = endAnchorBBox.x + 9
            this.view.state.transform.position.y = endAnchorBBox.y - 13

            const endBbox = this.endNode.getBoundingClientRect()
            this.view.renderer.viewEndAnchor.style.width = `${endBbox.width}px`
            this.view.renderer.viewEndAnchor.style.height = `${
                endBbox.height + (this.view.state.isCollapsed ? 0 : 14)
            }px`
        }

        let t =
            this.view.state.isAnchored &&
            this.view.state.anchor._type == 'ViewAnchor'
                ? 1
                : 0.2

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

        if (this.view.state.isCollapsed) {
            x = -9
            y = 13
            width = 5
            height = 5
        } else {
            const bodyBBox = this.viewBody.getBoundingClientRect()
            const bbox = this.element.getBoundingClientRect()

            x = bodyBBox.x - bbox.x
            y = bodyBBox.y - bbox.y
            width = bodyBBox.width
            height = bodyBBox.height
        }

        this.endNode.style.left = `${x}px`
        this.endNode.style.top = `${y}px`
        this.endNode.style.width = `${width}px`
        this.endNode.style.height = `${height}px`
    }

    updateStartNode() {
        if (this.view.state.isAnchored) {
            if (this.view.state.anchor._type == 'CodeAnchor') {
                const anchor = this.view.state.anchor as CodeAnchor
                const bbox = Editor.instance.computeBoundingBoxForLoc(
                    anchor.loc
                )

                this.startNode.style.left = `${bbox.x - 5}px`
                this.startNode.style.top = `${bbox.y}px`
                this.startNode.style.width = `${bbox.width + 10}px`
                this.startNode.style.height = `${bbox.height}px`
            } else {
                const anchor = this.view.renderer.viewAnchor
                const bbox = anchor.getBoundingClientRect()

                this.startNode.style.left = `${bbox.x}px`
                this.startNode.style.top = `${bbox.y}px`
                this.startNode.style.width = `${bbox.width}px`
                this.startNode.style.height = `${bbox.height}px`
            }
        }
    }

    destroy() {
        this.element.remove()

        this.startNode.remove()
        this.endNode.remove()
        this.connection.remove()
    }
}
