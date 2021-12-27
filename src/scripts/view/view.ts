import { getBoxToBoxArrow } from 'perfect-arrows'
import { createTransition } from '../animation/graph/abstraction/Transition'
import {
    AnimationGraph,
    instanceOfAnimationGraph,
} from '../animation/graph/AnimationGraph'
import { queryAnimationGraph } from '../animation/graph/graph'
import { AnimationNode } from '../animation/primitive/AnimationNode'
import { Editor } from '../editor/Editor'
import { AnimationRenderer } from '../environment/AnimationRenderer'
import { Executor } from '../executor/Executor'
import { getNumericalValueOfStyle, lerp } from '../utilities/math'
import { clone } from '../utilities/objects'
import { ViewConnection } from './ViewConnection'

export interface ViewTransform {
    dragging: boolean
    position: {
        x: number
        y: number
    }
}

// A group view is a collection of leaf views
export interface ViewState {
    _type: 'ViewState'
    animationId: string // TODO: Extend to multiple animations

    transform: ViewTransform
}

export class View {
    // State
    state: ViewState

    // Renderer
    indicator: HTMLDivElement // Indicator on the code
    element: HTMLDivElement // View element
    label: HTMLDivElement
    interactable: HTMLDivElement

    // Outgoing connections
    connections: ViewConnection[] = []
    connectionsContainer: HTMLDivElement

    // Misc
    private pMouse: { x: number; y: number }
    private compiledAnimation: AnimationGraph | AnimationNode = null
    private animationRenderer: AnimationRenderer = null

    connection: SVGPathElement

    constructor(animationId: string) {
        // Initial state
        this.state = {
            _type: 'ViewState',
            animationId: animationId,
            transform: { dragging: false, position: { x: 0, y: 0 } },
        }

        // Renderer
        this.element = document.createElement('div')
        this.element.classList.add('view')
        document.body.appendChild(this.element)

        this.label = document.createElement('div')
        this.label.classList.add('view-label')
        this.element.appendChild(this.label)

        this.indicator = document.createElement('div')
        this.indicator.classList.add('view-indicator')
        document.body.appendChild(this.indicator)

        // Initial position
        const animation = queryAnimationGraph(
            Executor.instance.animation,
            (node) => node.id == this.state.animationId
        )

        if (animation == null) return

        const location = animation.nodeData.location
        const bbox = Editor.instance.computeBoundingBoxForLoc(location)

        this.state.transform.position.x = bbox.x + bbox.width + 100
        this.state.transform.position.y = bbox.y - 30
        this.element.style.left = `${this.state.transform.position.x}px`
        this.element.style.top = `${this.state.transform.position.y}px`

        // Bind mouse events
        this.bindMouseEvents()

        // The connection path
        this.connection = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
        )
        this.connection.classList.add('connection-path')

        // Add them to global svg canvas
        const svg = document.getElementById('svg-canvas')
        svg.append(this.connection)

        this.label.innerHTML = animation.nodeData.type
            .replace(/([A-Z])/g, ' $1')
            .trim()

        // Setup the connections
        this.connectionsContainer = document.createElement('div')
        this.connectionsContainer.classList.add('view-connections')
        this.element.appendChild(this.connectionsContainer)

        if (instanceOfAnimationGraph(animation)) {
            // console.log(animationToString(animation))

            for (const child of animation.abstractions[0].vertices) {
                const connection = new ViewConnection(child.id)
                this.connections.push(connection)
                this.connectionsContainer.appendChild(connection.origin)
            }
        }

        // Setup the animation
        this.compiledAnimation = createTransition(clone(animation))
        this.animationRenderer = new AnimationRenderer(this.compiledAnimation)

        this.element.appendChild(this.animationRenderer.element)
    }

    tick(dt: number) {
        // Update position
        this.element.style.left = `${lerp(
            getNumericalValueOfStyle(this.element.style.left),
            this.state.transform.position.x,
            0.2
        )}px`
        this.element.style.top = `${lerp(
            getNumericalValueOfStyle(this.element.style.top),
            this.state.transform.position.y,
            0.2
        )}px`

        // Indicator
        const animation = queryAnimationGraph(
            Executor.instance.animation,
            (node) => node.id == this.state.animationId
        )

        if (animation == null) return

        const location = animation.nodeData.location
        const indicatorBbox = Editor.instance.computeBoundingBoxForLoc(location)

        this.indicator.style.top = `${indicatorBbox.y}px`
        this.indicator.style.left = `${indicatorBbox.x}px`
        this.indicator.style.width = `${indicatorBbox.width}px`
        this.indicator.style.height = `${indicatorBbox.height}px`

        const elementBbox = this.element.getBoundingClientRect()

        // Arrow
        const arrow = getBoxToBoxArrow(
            indicatorBbox.x,
            indicatorBbox.y,
            indicatorBbox.width,
            indicatorBbox.height,
            elementBbox.x,
            elementBbox.y,
            elementBbox.width,
            elementBbox.height,
            { padEnd: 0 }
        )

        const [sx, sy, cx, cy, ex, ey, ae, as, sc] = arrow

        this.connection.setAttribute(
            'd',
            `M${sx},${sy} Q${cx},${cy} ${ex},${ey}`
        )

        // Update animation
        // TODO: Make this part of an animation layer

        this.animationRenderer.tick(dt)
    }

    bindMouseEvents() {
        // Bind mouse events
        const node = this.label

        node.addEventListener('mousedown', this.mousedown.bind(this))
        node.addEventListener('mouseover', this.mouseover.bind(this))
        node.addEventListener('mouseout', this.mouseout.bind(this))

        document.body.addEventListener('mouseup', this.mouseup.bind(this))
        document.body.addEventListener('mousemove', this.mousemove.bind(this))
    }

    mousedown(e: MouseEvent) {
        this.state.transform.dragging = true
        this.element.classList.add('dragging')

        this.pMouse = {
            x: e.x,
            y: e.y,
        }

        console.log('Mouse down')
    }

    mouseup(e: MouseEvent) {
        if (this.state.transform.dragging) {
            this.state.transform.dragging = false
            this.element.classList.remove('dragging')
        }

        console.log('Mouse up')
    }

    mousemove(e: MouseEvent) {
        const mouse = { x: e.x, y: e.y }

        if (this.state.transform.dragging) {
            this.state.transform.position.x += mouse.x - this.pMouse.x
            this.state.transform.position.y += mouse.y - this.pMouse.y
        }

        this.pMouse = {
            x: e.x,
            y: e.y,
        }
    }

    mouseover(e: MouseEvent) {}

    mouseout(e: MouseEvent) {}
}
