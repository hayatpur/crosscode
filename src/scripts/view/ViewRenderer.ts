import { AnimationRenderer } from '../environment/AnimationRenderer'
import { instanceOfExecutionNode } from '../execution/primitive/ExecutionNode'
import { getNumericalValueOfStyle, lerp } from '../utilities/math'
import { GlobalTrace } from './Trace/GlobalTrace'
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
    animationToggle: HTMLDivElement
    traceToggle: HTMLDivElement

    // Body
    viewBody: HTMLDivElement

    // Animation
    animationRenderer: AnimationRenderer

    trace: TraceCollection
    globalTrace: GlobalTrace

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
            instanceOfExecutionNode(view.originalExecution)
                ? view.originalExecution.name
                : view.originalExecution.nodeData.type
        )
            .replace(/([A-Z])/g, ' $1')
            .trim()

        this.setupControls()

        // Body
        this.viewBody = document.createElement('div')
        this.viewBody.classList.add('view-body')
        this.element.appendChild(this.viewBody)

        this.trace = new TraceCollection(this.view)
        this.globalTrace = new GlobalTrace(this.view)
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
        this.setupTraceToggle()
        this.setupAnimationToggle()
    }

    setupTraceToggle() {
        this.traceToggle = document.createElement('div')
        this.traceToggle.classList.add('view-control-button')
        this.traceToggle.innerHTML = '<ion-icon name="git-branch-outline"></ion-icon>'
        this.header.appendChild(this.traceToggle)
    }

    setupAnimationToggle() {
        this.animationToggle = document.createElement('div')
        this.animationToggle.classList.add('view-control-button')
        this.animationToggle.innerHTML = '<ion-icon name="videocam-outline"></ion-icon>'
        this.header.appendChild(this.animationToggle)
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

        // Update animation
        // TODO: Make this part of an animation layer
        this.updateEndNode()
        this.updateStartNode()

        this.animationRenderer?.tick(dt)

        // Update trace
        this.trace.tick(dt)

        // Update global trace
        this.globalTrace.tick(dt)
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
