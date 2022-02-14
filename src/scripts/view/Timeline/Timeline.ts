import { AbstractionSelection } from '../../execution/graph/abstraction/Abstractor'
import { lerp } from '../../utilities/math'
import { View } from '../View'

export enum TimelineLayoutType {
    Vertical = 'Vertical',
    SourceCode = 'SourceCode',
}

export interface TimelineTransform {
    dragging: boolean
    position: {
        x: number
        y: number
    }
    layout: TimelineLayoutType
}

// A timeline can have a layout, e.g., it can be ordered based on the source code
// TODO: Setup controls
export class Timeline {
    // Renderer
    element: HTMLElement

    anchors: HTMLDivElement[] = []
    anchorContainer: HTMLDivElement

    // State
    transform: TimelineTransform
    views: View[] = []
    time: number = 0
    isPaused: boolean = true
    speed: number = 1 / 64

    parent: View

    // Temp
    private previousMouse: { x: number; y: number }

    constructor(parent: View) {
        this.parent = parent
        this.element = document.createElement('div')
        this.element.classList.add('timeline')
        document.body.appendChild(this.element)

        // this.labelElement = document.createElement('div')
        // this.labelElement.classList.add('timeline-label')
        // this.labelElement.innerText = 'Timeline'
        // this.header.appendChild(this.labelElement)

        this.anchorContainer = document.createElement('div')
        this.anchorContainer.classList.add('timeline-anchor-container')
        this.element.appendChild(this.anchorContainer)

        this.transform = {
            dragging: false,
            position: {
                x: 0,
                y: 0,
            },
            layout: TimelineLayoutType.Vertical,
        }

        // this.transform.layout = TimelineLayoutType.SourceCode

        // Add connection
        // const connection = document.createElementNS(
        //     'http://www.w3.org/2000/svg',
        //     'path'
        // )
        // connection.classList.add('timeline-connection')
        // document.getElementById('svg-canvas').append(connection)
        // this.connections.push(connection)

        // Bind mouse events
    }

    select() {
        this.element.classList.add('selected')
    }

    deselect() {
        this.element.classList.remove('selected')
    }

    addView(view: View) {
        // Add anchor
        const anchor = document.createElement('div')
        anchor.classList.add('timeline-anchor')
        this.anchorContainer.appendChild(anchor)
        this.anchors.push(anchor)

        // Add view
        this.views.push(view)

        // Add connection
        // const connection = document.createElementNS(
        //     'http://www.w3.org/2000/svg',
        //     'path'
        // )
        // connection.classList.add('timeline-connection')
        // document.getElementById('svg-canvas').append(connection)
        // this.connections.push(connection)

        const anchorBbox = anchor.getBoundingClientRect()
        const viewBbox = view.renderer.element.getBoundingClientRect()

        // Put view in right position
        view.state.transform.position.x = anchorBbox.x
        view.state.transform.position.y = anchorBbox.y

        // Update width and height of anchor
        anchor.style.width = `${viewBbox.width}px`
        anchor.style.height = `${viewBbox.height}px`

        view.renderer.updatePosition(1)
    }

    destroy() {
        for (const view of this.views) {
            view.destroy()
        }

        this.element.remove()
    }

    tick(dt: number) {
        // Position
        this.element.style.left = `${this.transform.position.x}px`
        this.element.style.top = `${this.transform.position.y}px`

        // Update position of anchors
        this.updateAnchorPositions()

        // Update position of views
        this.updateViewPositions()

        // Update connections
        this.updateConnections()

        // Seek into animation
        // if (this.time > this.getDuration()) {
        //     if (!this.isPaused) {
        //         this.endAnimation([])
        //     }
        // } else if (!this.isPaused) {
        //     this.seekAnimation(this.time, [])
        //     this.time += dt * this.speed
        // }
    }

    getDuration() {
        let duration = 0
        for (const view of this.views) {
            duration += view.getDuration()
        }
        return duration
    }

    updateConnections() {
        // for (let i = 0; i < this.connections.length; i++) {
        //     // Connection at i connects anchors at i and anchor at i + 1
        //     const connection = this.connections[i]
        //     const start =
        //         i == 0
        //             ? getPositionOfAnchor(this.startAnchor)
        //             : getPositionOfView(this.views[i - 1])
        //     const end =
        //         i == this.connections.length - 1
        //             ? getPositionOfAnchor(this.endAnchor)
        //             : getPositionOfView(this.views[i])
        //     if (i == this.connections.length - 1) {
        //         end.y -= 5
        //     }
        //     connection.setAttribute(
        //         'd',
        //         `M ${start.x} ${start.y} L${end.x} ${end.y}`
        //     )
        // }
    }

    updateAnchorPositions() {}

    updateViewPositions(t = 0.4) {
        for (let i = 0; i < this.views.length; i++) {
            const view = this.views[i]
            const anchor = this.anchors[i]

            const anchorBbox = anchor.getBoundingClientRect()
            const viewBbox = view.renderer.element.getBoundingClientRect()

            // Put view in right position
            view.state.transform.position.x = lerp(view.state.transform.position.x, anchorBbox.x, t)
            view.state.transform.position.y = lerp(view.state.transform.position.y, anchorBbox.y, t)

            // view.state.transform.scaleMultiplier =
            //     this.parent.state.transform.scale

            // Update width and height of anchor
            anchor.style.width = `${viewBbox.width}px`
            anchor.style.height = `${viewBbox.height}px`
        }
    }

    getAbstractionSelection(originId: string = null) {
        const selection: AbstractionSelection = {
            id: originId,
            selection: [],
        }

        for (const step of this.views) {
            selection.selection.push(step.getAbstractionSelection())
        }

        return selection
    }

    anchorToView(view: View) {
        view.renderer.stepsContainer.appendChild(this.element)
        this.element.classList.add('anchored')
    }

    unAnchor() {
        document.body.appendChild(this.element)
        this.element.classList.remove('anchored')
    }
}
