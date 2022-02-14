import { AnimationRenderer } from '../environment/AnimationRenderer'
import { instanceOfExecutionNode } from '../execution/primitive/ExecutionNode'
import { getNumericalValueOfStyle, lerp } from '../utilities/math'
import { TraceCollection } from './Trace/TraceCollection'
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
    collapseToggle: HTMLDivElement
    traceToggle: HTMLDivElement

    // Body
    viewBody: HTMLDivElement

    // Animation
    animationRenderer: AnimationRenderer

    trace: TraceCollection

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
            instanceOfExecutionNode(view.originalAnimation)
                ? view.originalAnimation.name
                : view.originalAnimation.nodeData.type
        )
            .replace(/([A-Z])/g, ' $1')
            .trim()

        this.setupControls()

        // Body
        this.viewBody = document.createElement('div')
        this.viewBody.classList.add('view-body')
        this.element.appendChild(this.viewBody)

        this.trace = new TraceCollection(this.view)
    }

    hide() {
        this.element.classList.add('hidden')
    }

    show() {
        this.element.classList.remove('hidden')
    }

    setupControls() {
        this.controlElement = document.createElement('div')
        this.controlElement.classList.add('view-controls')
        this.element.appendChild(this.controlElement)

        this.setupStepsToggle()
        this.setupCollapseToggle()
        this.setupTraceToggle()
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
        this.stepsToggle.innerHTML = '<ion-icon name="chevron-forward"></ion-icon>'
        // this.header.appendChild(this.stepsToggle)
    }

    setupCollapseToggle() {
        this.collapseToggle = document.createElement('div')
        this.collapseToggle.classList.add('view-control-button')
        this.collapseToggle.innerHTML = '<ion-icon name="add"></ion-icon>'
        // this.header.appendChild(this.collapseToggle)
    }

    setupTraceToggle() {
        this.traceToggle = document.createElement('div')
        this.traceToggle.classList.add('view-control-button')
        this.traceToggle.innerHTML = '<ion-icon name="git-branch-outline"></ion-icon>'
        this.header.appendChild(this.traceToggle)
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

    updatePosition(t = 0.8) {
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

        // Update scale
        // const scale = lerp(
        //     getNumericalValueOfStyle(
        //         this.element.style.transform.substring(6),
        //         1
        //     ),
        //     this.view.state.transform.scale,
        //     t * 0.1
        // )
        // this.element.style.transform = `scale(${
        //     scale * this.view.state.transform.scaleMultiplier
        // })`

        this.updateConnection()
    }

    tick(dt: number) {
        this.updatePosition()

        // Update trace
        this.updateTrace()

        // Update animation
        // TODO: Make this part of an animation layer
        this.updateEndNode()
        this.updateStartNode()

        this.animationRenderer?.tick(dt)
        this.trace.tick(dt)
    }

    updateTrace() {
        if (this.animationRenderer == null) return

        // if (this.view.state.isShowingTrace) {
        //     this.animationRenderer.showingPreRenderer = true
        // } else {
        //     this.animationRenderer.showingPreRenderer = false
        // }
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
    }

    updateStartNode() {}

    destroy() {
        this.element.remove()
        this.element = null
    }
}
