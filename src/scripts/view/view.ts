import { getBoxToBoxArrow } from 'perfect-arrows'
import { reset } from '../animation/animation'
import { GlobalAnimationCallbacks } from '../animation/GlobalAnimationCallbacks'
import { AbstractionSelection } from '../animation/graph/abstraction/Abstractor'
import {
    createTransition,
    createTransitionAnimationFromSelection,
} from '../animation/graph/abstraction/Transition'
import {
    AnimationGraph,
    instanceOfAnimationGraph,
} from '../animation/graph/AnimationGraph'
import {
    AnimationNode,
    instanceOfAnimationNode,
} from '../animation/primitive/AnimationNode'
import { Editor } from '../editor/Editor'
import { AnimationRenderer } from '../environment/AnimationRenderer'
import { TimelineRenderer } from '../environment/Timeline'
import { Executor } from '../executor/Executor'
import { getNumericalValueOfStyle, lerp } from '../utilities/math'
import { clone } from '../utilities/objects'

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
    transform: ViewTransform

    collapsed: boolean
    showingSteps: boolean
    attached: boolean
    anchoredToCode: boolean
}

export class View {
    // State
    state: ViewState

    // Renderer
    element: HTMLDivElement // View element

    header: HTMLDivElement
    label: HTMLDivElement

    interactable: HTMLDivElement

    // Steps
    steps: View[] = []
    stepsContainer: HTMLDivElement

    // Controls
    controlElement: HTMLDivElement
    stepsToggle: HTMLDivElement
    collapseToggle: HTMLDivElement

    // Body
    viewBody: HTMLDivElement

    // Misc
    private previousMouse: { x: number; y: number }
    private compiledAnimation: AnimationGraph | AnimationNode = null
    private animationRenderer: AnimationRenderer = null
    private timelineRenderer: TimelineRenderer = null
    private previousAbstractionSelection: string = null

    animation: AnimationGraph | AnimationNode

    // Start, end, and connection
    startNode: HTMLDivElement
    endNode: HTMLDivElement
    connection: SVGPathElement

    // Global animation callbacks
    private beginId: string
    private seekId: string
    private endId: string

    constructor(
        animation: AnimationGraph | AnimationNode,
        collapsed: boolean = false,
        attached: HTMLDivElement = null,
        anchoredToCode: boolean = true
    ) {
        // Initial state
        this.state = {
            _type: 'ViewState',
            transform: { dragging: false, position: { x: 0, y: 0 } },
            collapsed: collapsed,
            showingSteps: false,
            attached: false,
            anchoredToCode: anchoredToCode,
        }

        // Complete animation
        this.animation = animation

        // Default transition animation
        this.compiledAnimation = createTransition(clone(animation))

        // Element
        this.element = document.createElement('div')
        this.element.classList.add('view')

        // Attach
        if (attached !== null) {
            this.attach(attached)
        } else {
            this.detach()
        }

        // Header
        this.header = document.createElement('div')
        this.header.classList.add('view-header')
        this.element.appendChild(this.header)

        this.setupConnection()

        this.label = document.createElement('div')
        this.label.classList.add('view-label')
        this.header.appendChild(this.label)

        this.stepsContainer = document.createElement('div')
        this.stepsContainer.classList.add('view-steps-container')
        this.element.appendChild(this.stepsContainer)

        this.setupStepsToggle()
        this.setupCollapseToggle()

        // Bind mouse events
        this.bindMouseEvents()

        this.label.innerHTML = (
            instanceOfAnimationNode(animation)
                ? animation.name
                : animation.nodeData.type
        )
            .replace(/([A-Z])/g, ' $1')
            .trim()

        if (this.state.showingSteps) {
            this.createSteps()
        }

        // Body
        this.viewBody = document.createElement('div')
        this.viewBody.classList.add('view-body')
        this.element.appendChild(this.viewBody)

        // Setup the controls
        this.setupControls()

        if (this.state.collapsed) {
            this.collapse()
        } else {
            this.expand()
        }

        // Global animation callbacks
        this.setupGlobalAnimationCallbacks()
    }

    attach(parent: HTMLDivElement) {
        this.state.attached = true
        parent.appendChild(this.element)
        this.element.classList.add('attached')
    }

    detach() {
        this.state.attached = false
        this.element.classList.remove('attached')
        document.body.appendChild(this.element)
    }

    expand() {
        reset(this.compiledAnimation)

        this.state.collapsed = false

        this.animationRenderer = new AnimationRenderer(this.compiledAnimation)
        this.viewBody.appendChild(this.animationRenderer.element)

        this.timelineRenderer = new TimelineRenderer(
            this.compiledAnimation,
            this.animationRenderer
        )

        this.timelineRenderer.disable()
        this.viewBody.appendChild(this.timelineRenderer.element)

        this.element.classList.remove('collapsed')
        this.controlElement.classList.remove('disabled')

        this.endNode.classList.add('expanded')
        this.stepsContainer.classList.add('expanded')
    }

    collapse() {
        this.state.collapsed = true

        this.timelineRenderer?.destroy()
        this.animationRenderer?.destroy()

        this.timelineRenderer = null
        this.animationRenderer = null

        this.element.classList.add('collapsed')
        this.controlElement.classList.add('disabled')

        this.endNode.classList.remove('expanded')
        this.stepsContainer.classList.remove('expanded')
    }

    tick(dt: number) {
        // Update left
        const left = lerp(
            getNumericalValueOfStyle(this.element.style.left),
            this.state.transform.position.x,
            0.2
        )

        // Update right
        const top = lerp(
            getNumericalValueOfStyle(this.element.style.top),
            this.state.transform.position.y,
            0.2
        )

        // Update top
        this.element.style.left = `${left}px`
        this.element.style.top = `${top}px`

        if (this.state.anchoredToCode) {
            this.updateConnection()
        }

        // Update animation
        // TODO: Make this part of an animation layer

        this.updateEndNode()

        if (!this.state.collapsed) {
            this.timelineRenderer.tick(dt)
        }

        if (
            this.previousAbstractionSelection !=
            JSON.stringify(this.getAbstractionSelection())
        ) {
            this.previousAbstractionSelection = JSON.stringify(
                this.getAbstractionSelection()
            )
            this.updateAnimation()
        }

        if (!this.state.collapsed) {
            if (this.state.showingSteps) {
                for (const step of this.steps) {
                    step.tick(dt)
                }
            }
        }
    }

    updateEndNode() {
        if (this.state.collapsed) {
            this.endNode.style.left = `${-9}px`
            this.endNode.style.top = `${13}px`
            this.endNode.style.width = `${5}px`
            this.endNode.style.height = `${5}px`
        } else {
            const bodyBBox = this.viewBody.getBoundingClientRect()
            const bbox = this.element.getBoundingClientRect()

            this.endNode.style.left = `${bodyBBox.x - bbox.x}px`
            this.endNode.style.top = `${bodyBBox.y - bbox.y}px`
            this.endNode.style.width = `${bodyBBox.width}px`
            this.endNode.style.height = `${bodyBBox.height}px`
        }
    }

    updateConnection() {
        const start = this.startNode.getBoundingClientRect()
        const end = this.endNode.getBoundingClientRect()

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
            { padEnd: 0 }
        )

        const [sx, sy, cx, cy, ex, ey, ae, as, sc] = arrow

        this.connection.setAttribute(
            'd',
            `M${sx},${sy} Q${cx},${cy} ${ex},${ey}`
        )
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

        this.previousMouse = {
            x: e.x,
            y: e.y,
        }
    }

    mouseup(e: MouseEvent) {
        if (this.state.transform.dragging) {
            this.state.transform.dragging = false
            this.element.classList.remove('dragging')
        }
    }

    mousemove(e: MouseEvent) {
        const mouse = { x: e.x, y: e.y }

        if (this.state.transform.dragging) {
            this.state.transform.position.x += mouse.x - this.previousMouse.x
            this.state.transform.position.y += mouse.y - this.previousMouse.y
        }

        this.previousMouse = {
            x: e.x,
            y: e.y,
        }
    }

    mouseover(e: MouseEvent) {}

    mouseout(e: MouseEvent) {}

    setupControls() {
        this.controlElement = document.createElement('div')
        this.controlElement.classList.add('view-controls')
        this.element.appendChild(this.controlElement)

        this.viewBody.addEventListener('mouseenter', (e) => {
            if (!this.state.collapsed && this.timelineRenderer.disabled) {
                this.timelineRenderer.enable()
            }
        })

        this.viewBody.addEventListener('mouseleave', (e) => {
            if (!this.state.collapsed && !this.timelineRenderer.disabled) {
                this.timelineRenderer.disable()
            }
        })

        // Timing toggle
        // const timingToggle = document.createElement('div')
        // timingToggle.classList.add('view-control-button')
        // timingToggle.innerHTML = '<ion-icon name="time-outline"></ion-icon>'

        // timingToggle.addEventListener('click', () => {
        //     if (this.timelineRenderer.disabled) {
        //         this.timelineRenderer.enable()
        //         timingToggle.classList.add('active')
        //     } else {
        //         this.timelineRenderer.disable()
        //         timingToggle.classList.remove('active')
        //     }
        // })

        // this.controlElement.appendChild(timingToggle)
    }

    setupStepsToggle() {
        this.stepsToggle = document.createElement('div')
        this.stepsToggle.classList.add('view-control-button')
        this.stepsToggle.innerHTML =
            '<ion-icon name="chevron-forward"></ion-icon>'
        this.header.appendChild(this.stepsToggle)

        this.stepsToggle.addEventListener('click', () => {
            if (this.state.showingSteps) {
                this.destroySteps()
                this.stepsToggle.innerHTML =
                    '<ion-icon name="chevron-forward"></ion-icon>'
            } else {
                this.createSteps()
                this.stepsToggle.innerHTML =
                    '<ion-icon name="chevron-down"></ion-icon>'
            }
            this.stepsToggle.classList.toggle('active')
        })
    }

    setupCollapseToggle() {
        this.collapseToggle = document.createElement('div')
        this.collapseToggle.classList.add('view-control-button')
        this.collapseToggle.innerHTML = '<ion-icon name="add"></ion-icon>'
        this.header.appendChild(this.collapseToggle)
        this.collapseToggle.addEventListener('click', () => {
            if (!this.state.collapsed) {
                this.collapse()
                this.collapseToggle.innerHTML =
                    '<ion-icon name="add"></ion-icon>'
            } else {
                this.expand()
                this.collapseToggle.innerHTML =
                    '<ion-icon name="remove"></ion-icon>'
            }
            this.collapseToggle.classList.toggle('active')
        })
    }

    setupConnection() {
        this.startNode = document.createElement('div')
        this.startNode.classList.add('view-start-node')

        if (this.state.anchoredToCode) {
            const location = this.animation.nodeData.location
            const bbox = Editor.instance.computeBoundingBoxForLoc(location)

            this.state.transform.position.x = bbox.x + bbox.width + 100
            this.state.transform.position.y = bbox.y - 30
            this.element.style.left = `${this.state.transform.position.x}px`
            this.element.style.top = `${this.state.transform.position.y}px`

            const indicatorBbox =
                Editor.instance.computeBoundingBoxForLoc(location)
            indicatorBbox.x -= 5
            indicatorBbox.width += 10

            this.startNode.style.top = `${indicatorBbox.y}px`
            this.startNode.style.left = `${indicatorBbox.x}px`
            this.startNode.style.width = `${indicatorBbox.width}px`
            this.startNode.style.height = `${indicatorBbox.height}px`

            this.startNode.classList.add('code')

            document.body.appendChild(this.startNode)
        } else {
            this.element.appendChild(this.startNode)
        }

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

    createSteps() {
        this.state.showingSteps = true
        this.stepsContainer.classList.remove('hidden')

        if (instanceOfAnimationGraph(this.animation)) {
            for (const child of this.animation.vertices) {
                const step = new View(child, true, this.stepsContainer, false)
                this.steps.push(step)

                Executor.instance.view.addView(step)
            }
        } else {
            // TODO: Add steps for other types of animations
        }

        this.element.classList.add('showing-steps')
    }

    destroySteps() {
        this.state.showingSteps = false
        this.stepsContainer.classList.add('hidden')

        this.steps.forEach((step) => {
            step.destroy()
        })

        this.steps = []

        this.element.classList.remove('showing-steps')
    }

    destroy() {
        this.removeGlobalAnimationCallbacks()

        this.collapse()
        this.destroySteps()

        this.element.remove()
        this.element = null

        Executor.instance.view.removeView(this)
    }

    getAbstractionSelection(): AbstractionSelection {
        if (
            !this.state.showingSteps ||
            instanceOfAnimationNode(this.animation)
        ) {
            return {
                id: this.animation.id,
                selection: null,
            }
        }

        const selection: AbstractionSelection = {
            id: this.animation.id,
            selection: [],
        }

        for (const step of this.steps) {
            selection.selection.push(step.getAbstractionSelection())
        }

        return selection
    }

    updateAnimation() {
        const selection = this.getAbstractionSelection()
        const animation = createTransitionAnimationFromSelection(
            clone(this.animation),
            selection
        )

        this.compiledAnimation = animation

        this.timelineRenderer?.updateAnimation(animation)
    }

    setupGlobalAnimationCallbacks() {
        this.beginId = GlobalAnimationCallbacks.instance.registerBeginCallback(
            (animation) => {
                // console.log(
                //     'Begin',
                //     this.label.innerText,
                //     this.compiledAnimation.id,
                //     animation.id
                // )
                if (this.compiledAnimation.id == animation.id) {
                    this.element.classList.add('playing')
                }
            }
        )

        this.endId = GlobalAnimationCallbacks.instance.registerEndCallback(
            (animation) => {
                // console.log(
                //     'End',
                //     this.label.innerText,
                //     this.compiledAnimation.id,
                //     animation.id
                // )
                if (this.compiledAnimation.id == animation.id) {
                    this.element.classList.remove('playing')
                }
            }
        )
    }

    removeGlobalAnimationCallbacks() {
        GlobalAnimationCallbacks.instance.removeBeginCallback(this.beginId)
        GlobalAnimationCallbacks.instance.removeEndCallback(this.endId)
    }
}
