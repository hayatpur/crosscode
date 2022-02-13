import { begin, end, reset, seek, writes } from '../animation/animation'
import { instanceOfAnimationGraph } from '../animation/graph/AnimationGraph'
import { instanceOfAnimationNode } from '../animation/primitive/AnimationNode'
import { Editor } from '../editor/Editor'
import { AnimationRenderer } from '../environment/AnimationRenderer'
import { createPrototypicalEnvironment } from '../environment/environment'
import { Executor } from '../executor/Executor'
import { clone } from '../utilities/objects'
import { CodeQueryGroup } from './Query/CodeQuery/CodeQueryGroup'
import { Timeline } from './Timeline/Timeline'
import { View } from './View'

export class ViewController {
    view: View

    // Misc
    previousMouse: { x: number; y: number }
    startMouse: { x: number; y: number }

    temporaryCodeQuery: CodeQueryGroup

    constructor(view: View) {
        this.view = view

        // Bind mouse events
        this.bindMouseEvents()

        const { state, renderer } = this.view

        // Setup click behavior

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

        // renderer.collapseToggle.addEventListener('click', () => {
        //     if (!state.isCollapsed) {
        //         this.collapse()
        //         renderer.collapseToggle.innerHTML =
        //             '<ion-icon name="add"></ion-icon>'
        //     } else {
        //         this.expand()
        //         renderer.collapseToggle.innerHTML =
        //             '<ion-icon name="remove"></ion-icon>'
        //     }

        //     renderer.collapseToggle.classList.toggle('active')
        // })

        renderer.traceToggle.addEventListener('click', () => {
            if (!state.isShowingTrace) {
                this.showTrace()
            } else {
                this.hideTrace()
            }

            renderer.traceToggle.classList.toggle('active')
        })
    }

    hide() {
        this.view.state.isHidden = true
        this.view.renderer.hide()

        if (this.view.state.isShowingSteps) {
            this.view.stepsTimeline?.destroy()
            this.view.stepsTimeline = undefined
            this.view.state.isShowingSteps = false
        }
    }

    show() {
        this.view.state.isHidden = false
        this.view.renderer.show()
    }

    select() {
        const selection = new Set(
            writes(this.view.originalAnimation).map((w) => w.id)
        )
        this.view.renderer.animationRenderer?.select(selection)
        this.view.renderer.trace.select(selection)
        this.view.renderer.element.classList.add('selected')
    }

    deselect() {
        const deselection = new Set(
            writes(this.view.originalAnimation).map((w) => w.id)
        )
        this.view.renderer.animationRenderer?.deselect(deselection)
        this.view.renderer.trace.deselect(deselection)
        this.view.renderer.element.classList.remove('selected')
    }

    goToEnd() {
        this.resetAnimation([])
        this.beginAnimation([])
        this.seekAnimation(this.view.getDuration(), [])
        this.endAnimation([])

        console.log(this.view.state.isCollapsed)
        this.view.renderer.animationRenderer.update()
    }

    goToStart() {
        this.resetAnimation([])
        // this.beginAnimation([])
        this.view.renderer.animationRenderer.update()
    }

    createSteps(expanded: boolean = false) {
        const { state, renderer } = this.view
        state.isShowingSteps = true

        renderer.stepsContainer.classList.remove('hidden')

        this.view.stepsTimeline = new Timeline(this.view)
        this.view.stepsTimeline.anchorToView(this.view)

        let start = performance.now()

        if (instanceOfAnimationGraph(this.view.originalAnimation)) {
            const children = this.queryChildren()

            for (const child of children) {
                const step = Executor.instance.rootView.createView(child, {
                    expand: expanded,
                })
                this.view.stepsTimeline.addView(step)
            }
        }

        this.view.stepsTimeline.resetAnimation([])
        this.view.stepsTimeline.beginAnimation([])
        this.view.stepsTimeline.seekAnimation(
            this.view.stepsTimeline.getDuration(),
            []
        )
        this.view.stepsTimeline.endAnimation([])

        this.resetAnimation([])
        this.collapse()

        renderer.element.classList.add('showing-steps')
    }

    queryChildren() {
        if (instanceOfAnimationNode(this.view.originalAnimation)) {
            return []
        }
        const children = []
        const blacklist: Set<string> = new Set([
            'ConsumeDataAnimation',
            'PopScopeAnimation',
            'CreateScopeAnimation',
            'MoveAndPlaceAnimation',
        ])

        for (const child of this.view.originalAnimation.vertices) {
            if (instanceOfAnimationNode(child) && blacklist.has(child._name)) {
                continue
            } else if (blacklist.has(child.nodeData.type)) {
                continue
            }

            children.push(child)
        }

        return children
    }

    destroySteps() {
        const { state, renderer } = this.view
        state.isShowingSteps = false

        renderer.stepsContainer.classList.add('hidden')

        this.view.stepsTimeline.destroy()
        this.view.stepsTimeline = null
        this.expand()

        this.resetAnimation([])
        this.beginAnimation([])
        this.seekAnimation(this.view.getDuration(), [])
        this.endAnimation([])

        renderer.animationRenderer.update()

        this.view.renderer.stepsContainer.innerHTML = ''
        renderer.element.classList.remove('showing-steps')
    }

    showTrace() {
        const { state, renderer } = this.view

        state.isShowingTrace = true
        renderer.animationRenderer?.showTrace()
        renderer.trace.show()
    }

    hideTrace() {
        const { state, renderer } = this.view

        state.isShowingTrace = false
        renderer.animationRenderer?.hideTrace()
        renderer.trace.hide()
    }

    tick(dt: number) {
        const { state, renderer } = this.view

        // renderer.animationRenderer?.tick(dt)

        // if (this.view.isRoot) {
        //     const separator = Executor.instance.rootView.separator
        //     state.transform.position.x =
        //         getNumericalValueOfStyle(separator.element.style.left, 0) + 100
        //     state.transform.position.y = 100
        // }

        // Seek into animation
        // if (state.time > this.view.getDuration()) {
        //     // if (state.isPlaying) {
        //     //     this.endAnimation([])
        //     //     state.isPlaying = false
        //     //     state.hasPlayed = true
        //     // }
        // }
        // If steps were changed
        // const abstractionSelection = JSON.stringify(
        //     this.view.getAbstractionSelection()
        // )
        // if (state.abstractionSelection != abstractionSelection) {
        //     state.abstractionSelection = abstractionSelection
        //     this.resetAnimation([])
        // }
    }

    resetAnimation(renderers: AnimationRenderer[]) {
        const { state, renderer } = this.view

        if (renderer.animationRenderer != null) {
            renderers = [...renderers, renderer.animationRenderer]
        }

        state.time = 0
        state.isPlaying = false
        state.hasPlayed = false

        if (state.isShowingSteps && false) {
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

        if (state.isShowingSteps && false) {
            this.view.stepsTimeline.beginAnimation(renderers)
        } else {
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

        this.view.renderer.animationRenderer?.update()

        renderer.element.classList.add('playing')
    }

    endAnimation(renderers: AnimationRenderer[], force: boolean = false) {
        const { state, renderer } = this.view

        if (renderer.animationRenderer != null) {
            renderers = [...renderers, renderer.animationRenderer]
        }

        if (state.isShowingSteps && false) {
            this.view.stepsTimeline.endAnimation(renderers)
        } else {
            for (const renderer of renderers) {
                end(this.view.transitionAnimation, renderer.environment)
                if (force) {
                    const postcondition =
                        this.view.transitionAnimation.postcondition
                    renderer.environment = clone(postcondition)
                }
            }

            this.view.transitionAnimation.isPlaying = false
            this.view.transitionAnimation.hasPlayed = true
        }

        if (renderer.animationRenderer != null) {
            renderer.animationRenderer.showingPostRenderer = true
        }

        renderer.element.classList.remove('playing')
    }

    seekAnimation(time: number, renderers: AnimationRenderer[]) {
        const { state, renderer } = this.view

        if (renderer.animationRenderer != null) {
            renderers = [...renderers, renderer.animationRenderer]
        }

        state.time = time

        if (state.isShowingSteps && false) {
            this.view.stepsTimeline.seekAnimation(time, renderers)
        } else {
            for (const renderer of renderers) {
                // Apply transition
                seek(this.view.transitionAnimation, renderer.environment, time)
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

    mousedown(e: MouseEvent) {
        const { state, renderer } = this.view

        state.transform.dragging = true
        renderer.element.classList.add('dragging')

        this.startMouse = {
            x: e.x,
            y: e.y,
        }

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

            const dx = Math.abs(this.startMouse.x - e.x)
            const dy = Math.abs(this.startMouse.y - e.y)

            if (dx < 6 && dy < 6) {
                // Click!
                this.click()
            }
        }
    }

    mousemove(e: MouseEvent) {
        const { state } = this.view

        const mouse = { x: e.x, y: e.y }
        const transform = state.transform

        if (transform.dragging && !this.view.isRoot) {
            transform.position.x += mouse.x - this.previousMouse.x
            transform.position.y += mouse.y - this.previousMouse.y
        }

        this.previousMouse = {
            x: e.x,
            y: e.y,
        }
    }

    mouseover(e: MouseEvent) {
        const bbox = Editor.instance.computeBoundingBoxForLoc(
            this.view.originalAnimation.nodeData.location
        )
        const paddingX = 20
        const paddingY = 10

        bbox.x -= paddingX
        bbox.y -= paddingY
        bbox.width += paddingX * 2
        bbox.height += paddingY * 2

        // const test = document.querySelector('#test') as HTMLElement
        // test.style.left = `${bbox.x}px`
        // test.style.top = `${bbox.y}px`
        // test.style.width = `${bbox.width}px`
        // test.style.height = `${bbox.height}px`

        this.temporaryCodeQuery =
            Executor.instance.rootView.createCodeQueryGroup({
                selection: {
                    x: bbox.x,
                    y: bbox.y,
                    width: bbox.width,
                    height: bbox.height,
                },
            })

        // this.temporaryCodeQuery.queries[0].select(false)
    }

    mouseout(e: MouseEvent) {
        this.temporaryCodeQuery?.destroy()
    }

    click() {
        const { renderer, state } = this.view
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
    }

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

        renderer.stepsContainer.classList.remove('expanded')
    }
}
