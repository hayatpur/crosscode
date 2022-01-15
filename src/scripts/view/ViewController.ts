import { begin, end, reset, seek } from '../animation/animation'
import { instanceOfAnimationGraph } from '../animation/graph/AnimationGraph'
import { Editor } from '../editor/Editor'
import { AnimationRenderer } from '../environment/AnimationRenderer'
import { createPrototypicalEnvironment } from '../environment/environment'
import { clone } from '../utilities/objects'
import { View } from './View'

export class ViewController {
    view: View

    // Misc
    previousMouse: { x: number; y: number }

    constructor(view: View) {
        this.view = view

        // Bind mouse events
        this.bindMouseEvents()

        const { state, renderer } = this.view

        renderer.stepsToggle.addEventListener('click', () => {
            if (state.isShowingSteps) {
                this.destroySteps()
                renderer.stepsToggle.innerHTML =
                    '<ion-icon name="chevron-forward"></ion-icon>'
            } else {
                this.createSteps()
                renderer.stepsToggle.innerHTML =
                    '<ion-icon name="chevron-down"></ion-icon>'
            }

            renderer.stepsToggle.classList.toggle('active')
        })

        // this.viewBody.addEventListener('mouseenter', (e) => {
        //     if (!this.state.collapsed && this.timelineRenderer.disabled) {
        //         this.timelineRenderer.enable()
        //     }
        // })

        // this.viewBody.addEventListener('mouseleave', (e) => {
        //     if (!this.state.collapsed && !this.timelineRenderer.disabled) {
        //         this.timelineRenderer.disable()
        //     }
        // })

        renderer.collapseToggle.addEventListener('click', () => {
            if (!state.isCollapsed) {
                this.collapse()
                renderer.collapseToggle.innerHTML =
                    '<ion-icon name="add"></ion-icon>'
            } else {
                this.expand()
                renderer.collapseToggle.innerHTML =
                    '<ion-icon name="remove"></ion-icon>'
            }

            renderer.collapseToggle.classList.toggle('active')
        })

        renderer.resetButton.addEventListener('click', () => {
            this.resetAnimation([])
            this.unPause()
        })
    }

    unPause() {
        this.beginAnimation([])
        this.view.state.isPlaying = true
        this.view.state.hasPlayed = false
        this.view.state.isPaused = false
    }

    createSteps() {
        const { state, renderer } = this.view

        this.resetAnimation([])

        renderer.stepsContainer.classList.remove('hidden')

        if (instanceOfAnimationGraph(this.view.originalAnimation)) {
            for (const child of this.view.originalAnimation.vertices) {
                const step = new View(child)
                this.anchorView(step)

                this.view.steps.push(step)
            }
        }

        renderer.element.classList.add('showing-steps')
        state.isShowingSteps = true
    }

    destroySteps() {
        const { state, renderer } = this.view

        renderer.stepsContainer.classList.add('hidden')

        for (const step of this.view.steps) {
            step.destroy()
        }

        this.view.renderer.stepsContainer.innerHTML = ''

        this.view.steps = []

        renderer.element.classList.remove('showing-steps')
        state.isShowingSteps = false
    }

    anchorView(child: View) {
        const { renderer } = this.view

        this.addAnchor()

        const stepContainers = renderer.stepsContainer

        let anchor: HTMLDivElement

        if (stepContainers.children.length > 1) {
            anchor = stepContainers.children[
                stepContainers.children.length - 2
            ] as HTMLDivElement
        } else {
            anchor = renderer.label
        }

        const endAnchor = stepContainers.children[
            stepContainers.children.length - 1
        ] as HTMLDivElement

        child.controller.anchorToView(this.view, anchor, endAnchor)
    }

    addAnchor() {
        const anchor = document.createElement('div')
        anchor.classList.add('view-anchor')
        this.view.renderer.stepsContainer.appendChild(anchor)
    }

    tick(dt: number) {
        const { state, renderer } = this.view

        // Seek into animation
        if (state.time > this.view.getDuration()) {
            if (state.isPlaying) {
                this.endAnimation([])
                state.isPlaying = false
                state.hasPlayed = true
            }
        } else {
            if (state.isAnchored && state.anchor._type == 'CodeAnchor') {
                this.seekAnimation(state.time, [])

                if (!state.isPaused) {
                    state.time += dt * state.speed
                }
            }
        }

        // If steps were changed
        const abstractionSelection = JSON.stringify(
            this.view.getAbstractionSelection()
        )
        if (state.abstractionSelection != abstractionSelection) {
            state.abstractionSelection = abstractionSelection
            this.resetAnimation([])
        }
    }

    resetAnimation(renderers: AnimationRenderer[]) {
        const { state, renderer } = this.view

        if (renderer.animationRenderer != null) {
            renderers = [...renderers, renderer.animationRenderer]
        }

        state.time = 0
        state.isPlaying = false
        state.hasPlayed = false

        if (this.view.getAbstractionSelection().selection == null) {
            reset(this.view.transitionAnimation)
        }

        for (const step of this.view.steps) {
            step.controller.resetAnimation([])
        }

        console.log(
            'Resetting animation',
            this.view.transitionAnimation.nodeData,
            renderers.length
        )

        for (const renderer of renderers) {
            renderer.environment = createPrototypicalEnvironment()
            renderer.paths = {}
            renderer.update()
        }
    }

    beginAnimation(renderers: AnimationRenderer[]) {
        const { state, renderer } = this.view

        if (renderer.animationRenderer != null) {
            renderers = [...renderers, renderer.animationRenderer]
        }

        if (this.view.getAbstractionSelection().selection == null) {
            console.log(
                'Beginning animation',
                this.view.transitionAnimation.nodeData,
                renderers.length
            )

            for (const renderer of renderers) {
                const precondition = this.view.transitionAnimation.precondition
                renderer.environment = clone(precondition)
                begin(this.view.transitionAnimation, renderer.environment)
            }

            this.view.transitionAnimation.isPlaying = true
            this.view.transitionAnimation.hasPlayed = false
        }

        // for (const step of this.view.steps) {
        //     step.controller.beginAnimation(renderers)
        // }

        renderer.element.classList.add('playing')
    }

    endAnimation(renderers: AnimationRenderer[]) {
        const { state, renderer } = this.view

        if (renderer.animationRenderer != null) {
            renderers = [...renderers, renderer.animationRenderer]
        }

        if (this.view.getAbstractionSelection().selection == null) {
            console.log(
                'Ending animation',
                this.view.transitionAnimation.nodeData,
                renderers.length
            )

            for (const renderer of renderers) {
                end(this.view.transitionAnimation, renderer.environment)
            }

            this.view.transitionAnimation.isPlaying = false
            this.view.transitionAnimation.hasPlayed = true
        }

        for (const step of this.view.steps) {
            if (step.state.isPlaying) {
                step.controller.endAnimation(renderers)
                step.state.isPlaying = false
            }
        }

        if (renderer.animationRenderer != null) {
            renderer.animationRenderer.showingFinalRenderers = true
        }

        renderer.element.classList.remove('playing')
    }

    seekAnimation(time: number, renderers: AnimationRenderer[]) {
        console.log(time)
        const { state, renderer } = this.view

        if (renderer.animationRenderer != null) {
            renderers = [...renderers, renderer.animationRenderer]
        }

        state.time = time

        if (this.view.getAbstractionSelection().selection == null) {
            // console.log(
            //     'Seeking animation',
            //     this.view.transitionAnimation.nodeData,
            //     renderers.length
            // )

            for (const renderer of renderers) {
                // Apply transition
                seek(this.view.transitionAnimation, renderer.environment, time)
            }
        } else {
            // Seek into appropriate step and seek
            // Keep track of the start time (for sequential animations)
            let start = 0

            for (const step of this.view.steps) {
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
                if (
                    step.state.isPlaying &&
                    shouldBePlaying &&
                    !begunThisFrame
                ) {
                    step.controller.seekAnimation(time - start, renderers)
                }

                start += step.getDuration()
            }
        }

        renderer.animationRenderer?.update()
    }

    bindMouseEvents() {
        // Bind mouse events to label
        const node = this.view.renderer.label

        node.addEventListener('mousedown', this.mousedown.bind(this))
        node.addEventListener('mouseover', this.mouseover.bind(this))
        node.addEventListener('mouseout', this.mouseout.bind(this))

        document.body.addEventListener('mouseup', this.mouseup.bind(this))
        document.body.addEventListener('mousemove', this.mousemove.bind(this))
    }

    anchorToView(
        view: View,
        anchor: HTMLDivElement,
        endAnchor: HTMLDivElement
    ) {
        const { state, renderer } = this.view

        state.anchor = { _type: 'ViewAnchor', id: view.state.id }
        state.isAnchored = true

        renderer.viewAnchor = anchor
        renderer.viewEndAnchor = endAnchor

        // Update classes
        this.view.renderer.element.classList.add('anchored-to-view')
        this.view.renderer.startNode.classList.add('anchored-to-view')
    }

    anchorToCode() {
        const { state } = this.view

        const location = this.view.originalAnimation.nodeData.location
        state.anchor = {
            _type: 'CodeAnchor',
            loc: location,
        }

        const bbox = Editor.instance.computeBoundingBoxForLoc(location)

        state.transform.position.x = bbox.x + bbox.width + 100
        state.transform.position.y = bbox.y - 30
        state.isAnchored = true

        // Update classes
        this.view.renderer.element.classList.add('anchored-to-code')
        this.view.renderer.startNode.classList.add('anchored-to-code')
    }

    mousedown(e: MouseEvent) {
        const { state, renderer } = this.view

        state.transform.dragging = true
        renderer.element.classList.add('dragging')

        this.previousMouse = {
            x: e.x,
            y: e.y,
        }
    }

    mouseup(e: MouseEvent) {
        const { state, renderer } = this.view

        if (state.transform.dragging) {
            state.transform.dragging = false
            renderer.element.classList.remove('dragging')
        }
    }

    mousemove(e: MouseEvent) {
        const { state } = this.view

        const mouse = { x: e.x, y: e.y }
        const transform = state.transform

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

    // attach(parent: HTMLDivElement) {
    //     this.state.attached = true
    //     parent.appendChild(this.element)
    //     this.element.classList.add('attached')
    // }

    // detach() {
    //     this.state.attached = false
    //     this.element.classList.remove('attached')
    //     document.body.appendChild(this.element)
    // }

    expand() {
        const { state, renderer } = this.view

        state.isCollapsed = false

        renderer.animationRenderer = new AnimationRenderer(this.view)
        renderer.viewBody.appendChild(renderer.animationRenderer.element)

        renderer.element.classList.remove('collapsed')
        renderer.controlElement.classList.remove('disabled')

        renderer.endNode.classList.add('expanded')
        renderer.stepsContainer.classList.add('expanded')

        this.resetAnimation([])
        this.unPause()
    }

    collapse() {
        const { state, renderer } = this.view

        state.isCollapsed = true

        renderer.animationRenderer?.destroy()
        renderer.animationRenderer = null

        renderer.element.classList.add('collapsed')
        renderer.controlElement.classList.add('disabled')

        renderer.endNode.classList.remove('expanded')
        renderer.stepsContainer.classList.remove('expanded')
    }
}
