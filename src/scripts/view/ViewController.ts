import { Editor } from '../editor/Editor'
import { AnimationRenderer } from '../environment/AnimationRenderer'
import { writes } from '../execution/execution'
import { ExecutionGraph, instanceOfExecutionGraph } from '../execution/graph/ExecutionGraph'
import { ExecutionNode, instanceOfExecutionNode } from '../execution/primitive/ExecutionNode'
import { Executor } from '../executor/Executor'
import { CodeQuery } from './Query/CodeQuery/CodeQuery'
import { Timeline } from './Timeline/Timeline'
import { View } from './View'

export class ViewController {
    view: View

    // Misc
    previousMouse: { x: number; y: number }
    startMouse: { x: number; y: number }

    temporaryCodeQuery: CodeQuery

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
        const selection = new Set(writes(this.view.originalAnimation).map((w) => w.id))
        this.view.renderer.animationRenderer?.select(selection)
        this.view.renderer.trace.select(selection)
        this.view.renderer.element.classList.add('selected')
        this.view.stepsTimeline?.select()
    }

    deselect() {
        const deselection = new Set(writes(this.view.originalAnimation).map((w) => w.id))
        this.view.renderer.animationRenderer?.deselect(deselection)
        this.view.renderer.trace.deselect(deselection)
        this.view.renderer.element.classList.remove('selected')
        this.view.stepsTimeline?.deselect()
    }

    createSteps(expanded: boolean = false) {
        let start = performance.now()

        const { state, renderer } = this.view
        state.isShowingSteps = true

        renderer.stepsContainer.classList.remove('hidden')

        this.view.stepsTimeline = new Timeline(this.view)
        this.view.stepsTimeline.anchorToView(this.view)

        if (instanceOfExecutionGraph(this.view.originalAnimation)) {
            const children = this.queryChildren()

            for (const child of children) {
                const start = performance.now()
                console.log(child)
                const step = Executor.instance.rootView.createView(child, {
                    expand: expanded,
                })
                this.view.stepsTimeline.addView(step)
                console.log(
                    `Created step for ${child.nodeData.type} in ${performance.now() - start}ms`
                )
            }
        }

        // this.view.stepsTimeline.resetAnimation([])
        // this.view.stepsTimeline.beginAnimation([])
        // this.view.stepsTimeline.seekAnimation(this.view.stepsTimeline.getDuration(), [])
        // this.view.stepsTimeline.endAnimation([])

        // this.resetAnimation([])
        this.collapse()

        renderer.element.classList.add('showing-steps')

        console.log(`Created steps in ${performance.now() - start}ms`)
    }

    queryChildren(): (ExecutionGraph | ExecutionNode)[] {
        if (instanceOfExecutionNode(this.view.originalAnimation)) {
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
            if (instanceOfExecutionNode(child) && blacklist.has(child._name)) {
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

        this.temporaryCodeQuery?.destroy()

        this.temporaryCodeQuery = Executor.instance.rootView.createCodeQuery(this.view)
        this.temporaryCodeQuery.select(false)
    }

    mouseout(e: MouseEvent) {
        this.temporaryCodeQuery?.destroy()
        this.temporaryCodeQuery = null
    }

    click() {
        const { renderer, state } = this.view
        if (state.isShowingSteps) {
            this.destroySteps()
            renderer.stepsToggle.innerHTML = '<ion-icon name="chevron-forward"></ion-icon>'
        } else {
            this.createSteps(!state.isCollapsed)
            renderer.stepsToggle.innerHTML = '<ion-icon name="chevron-down"></ion-icon>'
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

        renderer.animationRenderer.update()
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
