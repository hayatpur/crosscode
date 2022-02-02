import { AbstractionSelection } from '../../animation/graph/abstraction/Abstractor'
import { Editor } from '../../editor/Editor'
import { AnimationRenderer } from '../../environment/AnimationRenderer'
import { getNumericalValueOfStyle, lerp } from '../../utilities/math'
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
    connections: SVGPathElement[] = []
    anchors: HTMLDivElement[] = []
    startAnchor: HTMLDivElement
    endAnchor: HTMLDivElement
    anchorContainer: HTMLDivElement
    // labelElement: HTMLElement
    header: HTMLElement
    resetButton: HTMLElement

    // State
    transform: TimelineTransform
    views: View[] = []
    time: number = 0
    isPaused: boolean = true
    speed: number = 1 / 64

    // Temp
    private previousMouse: { x: number; y: number }

    constructor() {
        this.element = document.createElement('div')
        this.element.classList.add('timeline')
        document.body.appendChild(this.element)

        this.header = document.createElement('div')
        this.header.classList.add('timeline-header')
        this.element.appendChild(this.header)

        // this.labelElement = document.createElement('div')
        // this.labelElement.classList.add('timeline-label')
        // this.labelElement.innerText = 'Timeline'
        // this.header.appendChild(this.labelElement)

        this.setupControls()

        this.anchorContainer = document.createElement('div')
        this.anchorContainer.classList.add('timeline-anchor-container')
        this.element.appendChild(this.anchorContainer)

        this.startAnchor = document.createElement('div')
        this.startAnchor.classList.add('timeline-anchor', 'start')
        // this.startAnchor.innerHTML = '<ion-icon name="ellipse"></ion-icon>'
        this.anchorContainer.appendChild(this.startAnchor)

        this.endAnchor = document.createElement('div')
        this.endAnchor.classList.add('timeline-anchor', 'end')
        // this.endAnchor.innerHTML =
        //     '<ion-icon name="ellipse-outline"></ion-icon>'
        this.anchorContainer.appendChild(this.endAnchor)

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
        const connection = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
        )
        connection.classList.add('timeline-connection')
        document.getElementById('svg-canvas').append(connection)
        this.connections.push(connection)

        // Bind mouse events
        this.bindMouseEvents()
    }

    setupControls() {
        this.resetButton = document.createElement('div')
        this.resetButton.classList.add('timeline-control-button')
        this.resetButton.innerHTML = '<ion-icon name="refresh"></ion-icon>'
        this.header.appendChild(this.resetButton)

        this.resetButton.addEventListener('click', () => {
            this.resetAnimation([])
        })
    }

    addView(view: View) {
        // Add anchor
        const anchor = document.createElement('div')
        anchor.classList.add('timeline-anchor')
        this.anchorContainer.appendChild(anchor)
        this.anchorContainer.appendChild(this.endAnchor)
        this.anchors.push(anchor)

        // Add view
        this.views.push(view)

        // Add connection
        const connection = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
        )
        connection.classList.add('timeline-connection')
        document.getElementById('svg-canvas').append(connection)
        this.connections.push(connection)

        this.resetAnimation([])
    }

    destroy() {}

    bindMouseEvents() {
        // Bind mouse events to label
        const node = this.startAnchor

        node.addEventListener('mousedown', this.mousedown.bind(this))
        node.addEventListener('mouseover', this.mouseover.bind(this))
        node.addEventListener('mouseout', this.mouseout.bind(this))

        document.body.addEventListener('mouseup', this.mouseup.bind(this))
        document.body.addEventListener('mousemove', this.mousemove.bind(this))
    }

    mousedown(e: MouseEvent) {
        this.transform.dragging = true
        this.element.classList.add('dragging')

        this.previousMouse = {
            x: e.x,
            y: e.y,
        }
    }

    mouseup(e: MouseEvent) {
        if (this.transform.dragging) {
            this.transform.dragging = false
            this.element.classList.remove('dragging')
        }
    }

    mousemove(e: MouseEvent) {
        const mouse = { x: e.x, y: e.y }
        const transform = this.transform

        if (transform.dragging) {
            transform.position.x += mouse.x - this.previousMouse.x
            transform.position.y += mouse.y - this.previousMouse.y
        }

        this.previousMouse = {
            x: e.x,
            y: e.y,
        }
    }

    mouseover(e: MouseEvent) {}

    mouseout(e: MouseEvent) {}

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
        if (this.time > this.getDuration()) {
            // if (!this.isPaused) {
            //     this.endAnimation()
            // }
        } else if (!this.isPaused) {
            this.seekAnimation(this.time, [])
            this.time += dt * this.speed
        }
    }

    getDuration() {
        let duration = 0
        for (const view of this.views) {
            duration += view.getDuration()
        }
        return duration
    }

    beginAnimation(renderers: AnimationRenderer[]) {}

    endAnimation(renderers: AnimationRenderer[]) {
        for (const step of this.views) {
            if (step.state.isPlaying) {
                step.controller.endAnimation(renderers)
                step.state.isPlaying = false
                step.state.hasPlayed = true
            }
        }
    }

    resetAnimation(renderers: AnimationRenderer[]) {
        this.time = 0
        this.isPaused = false

        for (const step of this.views) {
            step.controller.resetAnimation(renderers)
        }
    }

    seekAnimation(time: number, renderers: AnimationRenderer[]) {
        // Seek into appropriate step and seek
        // Keep track of the start time (for sequential animations)
        let start = 0

        for (const step of this.views) {
            // If the animation should be playing
            const shouldBePlaying =
                time >= start && time < start + step.getDuration()

            // End animation
            if (step.state.isPlaying && !shouldBePlaying) {
                // Before ending, seek into the animation at it's end time
                step.controller.seekAnimation(step.getDuration(), renderers)
                step.controller.endAnimation(renderers)
                step.state.hasPlayed = true
                step.state.isPlaying = false
            }

            let begunThisFrame = false

            // Begin animation
            if (!step.state.isPlaying && shouldBePlaying) {
                step.controller.beginAnimation(renderers)
                step.state.isPlaying = true
                step.state.hasPlayed = false
                begunThisFrame = true
            }

            // Skip over this animation
            if (
                time >= start + step.getDuration() &&
                !step.state.isPlaying &&
                !step.state.hasPlayed
            ) {
                step.controller.beginAnimation(renderers)
                step.state.isPlaying = true
                step.controller.seekAnimation(step.getDuration(), renderers)
                step.controller.endAnimation(renderers)
                step.state.isPlaying = false
                step.state.hasPlayed = true
            }

            // Seek into animation
            if (step.state.isPlaying && shouldBePlaying && !begunThisFrame) {
                step.controller.seekAnimation(time - start, renderers)
            }

            start += step.getDuration()
        }
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

    updateAnchorPositions() {
        if (this.transform.layout == TimelineLayoutType.SourceCode) {
            this.anchorContainer.classList.add('source-code')
        } else {
            this.anchorContainer.classList.remove('source-code')
        }

        if (this.transform.layout == TimelineLayoutType.SourceCode) {
            const containerBbox = this.anchorContainer.getBoundingClientRect()
            for (let i = 0; i < this.anchors.length; i++) {
                const anchor = this.anchors[i]
                const view = this.views[i]

                const target = Editor.instance.computeBoundingBoxForLoc(
                    view.transitionAnimation.nodeData.location
                )
                target.y += target.height / 2

                anchor.style.top = `${target.y - containerBbox.y - 15}px`
                anchor.style.left = `${0}px`
            }

            // Update start anchor
            this.startAnchor.style.top = `${0}px`
            this.startAnchor.style.left = `${0}px`

            // Update end anchor
            if (this.anchors.length > 0) {
                const lastAnchor = this.anchors[this.anchors.length - 1]
                const lastAnchorTop = getNumericalValueOfStyle(
                    lastAnchor.style.top,
                    0
                )
                this.endAnchor.style.top = `${lastAnchorTop + 20}px`
                this.endAnchor.style.left = `${0}px`
            } else {
                this.endAnchor.style.top = `${20}px`
                this.endAnchor.style.left = `${0}px`
            }
        }
    }

    updateViewPositions() {
        for (let i = 0; i < this.views.length; i++) {
            const view = this.views[i]
            const anchor = this.anchors[i]

            const anchorBbox = anchor.getBoundingClientRect()
            const viewBbox = view.renderer.element.getBoundingClientRect()

            // Put view in right position
            view.state.transform.position.x = lerp(
                view.state.transform.position.x,
                anchorBbox.x + 12,
                0.4
            )
            view.state.transform.position.y = lerp(
                view.state.transform.position.y,
                anchorBbox.y,
                0.4
            )

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

function getPositionOfView(view: View) {
    const bbox = view.renderer.endNode.getBoundingClientRect()
    const position = {
        x: bbox.x + bbox.width / 2,
        y: bbox.y + bbox.height / 2,
    }

    return position
}

function getPositionOfAnchor(anchor: HTMLDivElement) {
    const bbox = anchor.getBoundingClientRect()
    const position = {
        x: bbox.x + bbox.width / 2,
        y: bbox.y + bbox.height / 2,
    }

    if (anchor.classList.contains('end')) {
        position.y += 5
    }

    return position
}
