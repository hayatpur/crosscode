import { begin, end, reset, seek } from '../animation/animation'
import { instanceOfAnimationGraph } from '../animation/graph/AnimationGraph'
import { AnimationRenderer } from '../environment/AnimationRenderer'
import { createPrototypicalEnvironment } from '../environment/environment'
import { clone } from '../utilities/objects'
import { createView } from '../utilities/view'
import { Timeline } from './Timeline/Timeline'
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
                this.createSteps(!state.isCollapsed)
                renderer.stepsToggle.innerHTML =
                    '<ion-icon name="chevron-down"></ion-icon>'
            }

            renderer.stepsToggle.classList.toggle('active')
        })

        renderer.hardStepsToggle.addEventListener('click', () => {
            this.createHardSteps(!state.isCollapsed)
            // if (state.isShowingSteps) {
            //     this.destroySteps()
            //     renderer.stepsToggle.innerHTML =
            //         '<ion-icon name="chevron-forward"></ion-icon>'
            // } else {
            //     this.createSteps()
            //     renderer.stepsToggle.innerHTML =
            //         '<ion-icon name="chevron-down"></ion-icon>'
            // }

            // renderer.stepsToggle.classList.toggle('active')
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
    }

    createSteps(expanded: boolean = false) {
        const { state, renderer } = this.view

        renderer.stepsContainer.classList.remove('hidden')

        this.view.stepsTimeline = new Timeline()
        this.view.stepsTimeline.anchorToView(this.view)

        if (instanceOfAnimationGraph(this.view.originalAnimation)) {
            for (const child of this.view.originalAnimation.vertices) {
                const step = createView(child)
                if (expanded) {
                    step.controller.expand()
                }
                this.view.stepsTimeline.addView(step)
            }
        }

        this.resetAnimation([])
        // if (!state.isCollapsed) {
        //     this.collapse()
        // }

        renderer.element.classList.add('showing-steps')
        // state.isShowingSteps = true
    }

    createHardSteps(expanded: boolean = false) {
        this.view.stepsTimeline = new Timeline()

        const bbox = this.view.renderer.element.getBoundingClientRect()
        this.view.stepsTimeline.transform.position.x =
            bbox.left + bbox.width + 50
        this.view.stepsTimeline.transform.position.y = bbox.top

        if (instanceOfAnimationGraph(this.view.originalAnimation)) {
            for (const child of this.view.originalAnimation.vertices) {
                const step = createView(child)
                if (expanded) {
                    step.controller.expand()
                }
                this.view.stepsTimeline.addView(step)
            }
        }
    }

    destroySteps() {
        const { state, renderer } = this.view

        renderer.stepsContainer.classList.add('hidden')

        this.view.stepsTimeline.destroy()

        this.view.renderer.stepsContainer.innerHTML = ''
        renderer.element.classList.remove('showing-steps')
        state.isShowingSteps = false
    }

    tick(dt: number) {
        const { state, renderer } = this.view

        // Seek into animation
        // if (state.time > this.view.getDuration()) {
        //     // if (state.isPlaying) {
        //     //     this.endAnimation([])
        //     //     state.isPlaying = false
        //     //     state.hasPlayed = true
        //     // }
        // }
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

        if (state.isShowingSteps) {
            this.view.stepsTimeline.resetAnimation(renderers)
        } else {
            reset(this.view.transitionAnimation)
        }

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

        if (!state.isShowingSteps) {
            for (const renderer of renderers) {
                const precondition = this.view.transitionAnimation.precondition
                renderer.environment = clone(precondition)

                begin(this.view.transitionAnimation, renderer.environment)
            }

            this.view.transitionAnimation.isPlaying = true
            this.view.transitionAnimation.hasPlayed = false
        } else {
            this.view.stepsTimeline.beginAnimation(renderers)
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

        if (state.isShowingSteps) {
            this.view.stepsTimeline.endAnimation(renderers)
        } else {
            for (const renderer of renderers) {
                end(this.view.transitionAnimation, renderer.environment)
            }

            this.view.transitionAnimation.isPlaying = false
            this.view.transitionAnimation.hasPlayed = true
        }

        if (renderer.animationRenderer != null) {
            renderer.animationRenderer.showingFinalRenderers = true
        }

        renderer.element.classList.remove('playing')
    }

    seekAnimation(time: number, renderers: AnimationRenderer[]) {
        const { state, renderer } = this.view

        if (renderer.animationRenderer != null) {
            renderers = [...renderers, renderer.animationRenderer]
        }

        state.time = time

        if (state.isShowingSteps) {
            this.view.stepsTimeline.seekAnimation(time, renderers)
        } else {
            for (const renderer of renderers) {
                // Apply transition
                seek(this.view.transitionAnimation, renderer.environment, time)
            }
        }

        console.log('Updating...', this.view.originalAnimation.nodeData.type)
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
