import { instanceOfAnimationGraph } from '../animation/graph/AnimationGraph'
import { Editor } from '../editor/Editor'
import { View } from './View'

export class ViewController {
    view: View

    // Misc
    previousMouse: { x: number; y: number }

    constructor(view: View) {
        this.view = view

        // Bind mouse events
        this.bindMouseEvents()

        this.view.renderer.stepsToggle.addEventListener('click', () => {
            if (this.view.state.isShowingSteps) {
                this.destroySteps()
                this.view.renderer.stepsToggle.innerHTML =
                    '<ion-icon name="chevron-forward"></ion-icon>'
            } else {
                this.createSteps()
                this.view.renderer.stepsToggle.innerHTML =
                    '<ion-icon name="chevron-down"></ion-icon>'
            }

            this.view.renderer.stepsToggle.classList.toggle('active')
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

        // this.collapseToggle.addEventListener('click', () => {
        //     if (!this.state.collapsed) {
        //         this.collapse()
        //         this.collapseToggle.innerHTML =
        //             '<ion-icon name="add"></ion-icon>'
        //     } else {
        //         this.expand()
        //         this.collapseToggle.innerHTML =
        //             '<ion-icon name="remove"></ion-icon>'
        //     }
        //     this.collapseToggle.classList.toggle('active')
        // })

        // this.resetButton.addEventListener('click', () => {
        //     this.resetAnimation([])
        // })
    }

    createSteps() {
        this.view.renderer.stepsContainer.classList.remove('hidden')

        if (instanceOfAnimationGraph(this.view.originalAnimation)) {
            for (const child of this.view.originalAnimation.vertices) {
                const step = new View(child)
                this.anchorView(step)

                this.view.steps.push(step)
            }
        }

        this.view.renderer.element.classList.add('showing-steps')
        this.view.state.isShowingSteps = true
    }

    destroySteps() {
        this.view.renderer.stepsContainer.classList.add('hidden')

        for (const step of this.view.steps) {
            step.destroy()
        }

        this.view.steps = []

        this.view.renderer.element.classList.remove('showing-steps')
        this.view.state.isShowingSteps = false
    }

    anchorView(child: View) {
        this.addAnchor()

        const stepContainers = this.view.renderer.stepsContainer

        const startElement =
            stepContainers.children[stepContainers.children.length - 2]
        const anchor =
            stepContainers.children[stepContainers.children.length - 1]

        child.controller.anchorToView(this.view, startElement, anchor)
    }

    addAnchor() {
        const anchor = document.createElement('div')
        anchor.classList.add('anchor')
        this.view.renderer.stepsContainer.appendChild(anchor)
    }

    tick(dt: number) {
        //     // Seek into animation
        //     if (this.time > this.getDuration()) {
        //         if (this.isPlaying) {
        //             this.endAnimation([])
        //         }
        //         // this.animationRenderer.showingFinalRenderers = true
        //     } else {
        //         if (this.state.anchoredToCode) {
        //             this.seekAnimation(this.time, [])
        //             if (!this.paused) {
        //                 this.time += dt * this.speed
        //             }
        //         }
        //     }
        //     // If steps were changed
        //     if (
        //         this.previousAbstractionSelection !=
        //         JSON.stringify(this.getAbstractionSelection())
        //     ) {
        //         this.previousAbstractionSelection = JSON.stringify(
        //             this.getAbstractionSelection()
        //         )
        //         this.resetAnimation([])
        //     }
    }

    // resetAnimation(renderers: AnimationRenderer[]) {
    //     if (this.animationRenderer != null) {
    //         renderers = [...renderers, this.animationRenderer]
    //     }

    //     this.time = 0

    //     if (this.getAbstractionSelection().selection == null) {
    //         reset(this.transitionAnimation)

    //         for (const renderer of renderers) {
    //             // renderer.environment = clone(
    //             //     this.transitionAnimation.precondition
    //             // )
    //             renderer.paths = {}
    //         }
    //     } else {
    //         for (const step of this.steps) {
    //             step.resetAnimation(renderers)
    //         }
    //     }
    // }

    // beginAnimation(renderers: AnimationRenderer[]) {
    //     if (this.animationRenderer != null) {
    //         renderers = [...renderers, this.animationRenderer]
    //     }

    //     if (this.getAbstractionSelection().selection == null) {
    //         for (const renderer of renderers) {
    //             renderer.environment = clone(
    //                 this.transitionAnimation.precondition
    //             )
    //             begin(this.transitionAnimation, renderer.environment)
    //         }
    //         this.transitionAnimation.isPlaying = true
    //         this.transitionAnimation.hasPlayed = false
    //     }

    //     this.element.classList.add('playing')

    //     // TODO: Begin expanded steps
    // }

    // endAnimation(renderers: AnimationRenderer[]) {
    //     if (this.animationRenderer != null) {
    //         renderers = [...renderers, this.animationRenderer]
    //     }

    //     if (this.getAbstractionSelection().selection == null) {
    //         for (const renderer of renderers) {
    //             end(this.transitionAnimation, renderer.environment)
    //         }
    //         this.transitionAnimation.isPlaying = false
    //         this.transitionAnimation.hasPlayed = true
    //     }

    //     for (const step of this.steps) {
    //         step.endAnimation(renderers)
    //     }

    //     this.isPlaying = false
    //     this.element.classList.remove('playing')
    // }

    // seekAnimation(time: number, renderers: AnimationRenderer[]) {
    //     if (this.animationRenderer != null) {
    //         renderers = [...renderers, this.animationRenderer]
    //     }

    //     this.time = time

    //     if (this.getAbstractionSelection().selection == null) {
    //         for (const renderer of renderers) {
    //             // Apply transition
    //             seek(this.transitionAnimation, renderer.environment, time)
    //         }
    //     } else {
    //         // Seek into appropriate step and seek
    //         // Keep track of the start time (for sequential animations)
    //         let start = 0

    //         for (const step of this.steps) {
    //             // If the animation should be playing
    //             const shouldBePlaying =
    //                 time >= start && time < start + step.getDuration()

    //             // End animation
    //             if (step.isPlaying && !shouldBePlaying) {
    //                 // Before ending, seek into the animation at it's end time
    //                 step.seekAnimation(step.getDuration(), renderers)
    //                 step.endAnimation(renderers)
    //                 step.hasPlayed = true
    //                 step.isPlaying = false
    //             }

    //             let begunThisFrame = false

    //             // Begin animation
    //             if (!step.isPlaying && shouldBePlaying) {
    //                 step.beginAnimation(renderers)
    //                 step.isPlaying = true
    //                 begunThisFrame = true
    //             }

    //             // Skip over this animation
    //             if (
    //                 time >= start + step.getDuration() &&
    //                 !step.isPlaying &&
    //                 !step.hasPlayed
    //             ) {
    //                 step.beginAnimation(renderers)
    //                 step.isPlaying = true
    //                 step.seekAnimation(step.getDuration(), renderers)
    //                 step.endAnimation(renderers)
    //                 step.isPlaying = false
    //                 step.hasPlayed = true
    //             }

    //             // Seek into animation
    //             if (step.isPlaying && shouldBePlaying && !begunThisFrame) {
    //                 step.seekAnimation(time - start, renderers)
    //             }

    //             start += step.getDuration()
    //         }
    //     }

    //     if (this.animationRenderer != null) {
    //         this.animationRenderer.update()
    //     }

    //     // TODO: Seek in expanded steps
    // }

    bindMouseEvents() {
        // Bind mouse events to label
        const node = this.view.renderer.label

        node.addEventListener('mousedown', this.mousedown.bind(this))
        node.addEventListener('mouseover', this.mouseover.bind(this))
        node.addEventListener('mouseout', this.mouseout.bind(this))

        document.body.addEventListener('mouseup', this.mouseup.bind(this))
        document.body.addEventListener('mousemove', this.mousemove.bind(this))
    }

    anchorToView(view: View, anchor: HTMLDivElement) {
        this.view.state.anchor = { _type: 'ViewAnchor', id: view.state.id }
        this.view.state.isAnchored = true
    }

    anchorToCode() {
        const location = this.view.originalAnimation.nodeData.location
        this.view.state.anchor = {
            _type: 'CodeAnchor',
            loc: location,
        }

        const bbox = Editor.instance.computeBoundingBoxForLoc(location)

        this.view.state.transform.position.x = bbox.x + bbox.width + 100
        this.view.state.transform.position.y = bbox.y - 30
        this.view.state.isAnchored = true
    }

    mousedown(e: MouseEvent) {
        this.view.state.transform.dragging = true
        this.view.renderer.element.classList.add('dragging')

        this.previousMouse = {
            x: e.x,
            y: e.y,
        }
    }

    mouseup(e: MouseEvent) {
        if (this.view.state.transform.dragging) {
            this.view.state.transform.dragging = false
            this.view.renderer.element.classList.remove('dragging')
        }
    }

    mousemove(e: MouseEvent) {
        const mouse = { x: e.x, y: e.y }
        const transform = this.view.state.transform

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

    // expand() {
    //     this.state.collapsed = false

    //     this.animationRenderer = new AnimationRenderer(this)
    //     this.viewBody.appendChild(this.animationRenderer.element)
    //     this.viewBody.appendChild(this.timelineRenderer.element)

    //     this.element.classList.remove('collapsed')
    //     this.controlElement.classList.remove('disabled')

    //     this.endNode.classList.add('expanded')
    //     this.stepsContainer.classList.add('expanded')
    // }

    // collapse() {
    //     this.state.collapsed = true

    //     this.animationRenderer?.destroy()
    //     this.animationRenderer = null

    //     this.timelineRenderer.element.remove()

    //     this.element.classList.add('collapsed')
    //     this.controlElement.classList.add('disabled')

    //     this.endNode.classList.remove('expanded')
    //     this.stepsContainer.classList.remove('expanded')
    // }
}
