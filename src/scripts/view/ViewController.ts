import { Editor } from '../editor/Editor'
import { AnimationRenderer } from '../environment/AnimationRenderer'
import { ArrayRenderer } from '../environment/data/array/ArrayRenderer'
import { ObjectRenderer } from '../environment/data/object/ObjectRenderer'
import { reads, writes } from '../execution/execution'
import { instanceOfExecutionGraph } from '../execution/graph/ExecutionGraph'
import { getDepthOfView, getLeavesOfView } from '../execution/graph/graph'
import { Executor } from '../executor/Executor'
import { flipAnimate } from '../utilities/dom'
import { lerp } from '../utilities/math'
import { AnimationPlayer } from './Animation/AnimationPlayer'
import { ControlFlow } from './Control Flow/ControlFlow'
import { CodeQuery } from './Query/CodeQuery/CodeQuery'
import { ViewSelectionType } from './Query/CodeQuery/CodeQueryGroup'
import { Timeline } from './Timeline/Timeline'
import { View } from './View'

export class ViewController {
    view: View

    // Misc
    previousMouse: { x: number; y: number }
    startMouse: { x: number; y: number }

    temporaryCodeQuery: CodeQuery

    attachedTo: HTMLElement = null

    controlFlow: ControlFlow

    toAnimate: { id: string; el: HTMLElement }[] = []

    isDraggingEmbedded = false
    isAnchored = false

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

        renderer.controlFlowToggle.addEventListener('click', () => {
            if (!state.isShowingControlFlow) {
                this.showControlFlow()
            } else {
                this.hideControlFlow()
            }

            renderer.controlFlowToggle.classList.toggle('active')
        })

        renderer.separateToggle.addEventListener('click', () => {
            if (!state.isSeparated) {
                this.separate()
            } else {
                this.unSeparate()
            }

            renderer.separateToggle.classList.toggle('active')
        })

        renderer.animationToggle.addEventListener('click', () => {
            if (!state.isPlayingAnimation) {
                this.playAnimation()
            }

            renderer.animationToggle.classList.add('active')
        })

        this.temporaryCodeQuery = Executor.instance.rootView.createCodeQuery(
            {
                view: this.view,
                type: ViewSelectionType.CodeToView,
            },
            true
        )
    }

    showControlFlow() {
        this.controlFlow?.destroy()
        this.controlFlow = new ControlFlow(this.view)

        this.view.state.isShowingControlFlow = true
    }

    hideControlFlow() {
        this.controlFlow?.destroy()
        this.controlFlow = null

        this.view.state.isShowingControlFlow = false
    }

    separate() {
        this.view.state.isSeparated = true
        this.view.renderer.animationRenderer?.separate()
    }

    unSeparate() {
        this.view.state.isSeparated = false
        this.view.renderer.animationRenderer?.unSeparate(!this.view.state.isShowingTrace)
    }

    playAnimation() {
        this.view.animationPlayer.restart()

        this.view.state.isPlayingAnimation = true
    }

    stopAnimation() {
        this.view.animationPlayer.pause()

        this.view.state.isPlayingAnimation = false
        this.view.renderer.animationToggle.classList.remove('active')
    }

    hide() {
        this.view.state.isHidden = true
        this.view.renderer.hide()

        if (this.view.state.isShowingSteps) {
            this.view.stepsTimeline?.destroy()
            this.view.stepsTimeline = undefined
            this.view.state.isShowingSteps = false
        }

        this.temporaryCodeQuery.hide()
    }

    show() {
        this.view.state.isHidden = false
        this.view.renderer.show()
        this.temporaryCodeQuery.show()
    }

    select() {
        const selection = new Set([
            ...writes(this.view.originalExecution).map((w) => w.id),
            ...reads(this.view.originalExecution).map((r) => r.id),
        ])
        this.view.renderer.animationRenderer?.select(selection)
        this.view.renderer.trace.select(selection)
        this.view.renderer.element.classList.add('selected')
        this.view.stepsTimeline?.select()

        this.view.state.isSelected = true
    }

    deselect() {
        this.view.renderer?.animationRenderer?.deselect()
        this.view.renderer?.trace.deselect()
        this.view.renderer?.element?.classList.remove('selected')
        this.view.stepsTimeline?.deselect()

        this.view.state.isSelected = false
    }

    detachForAnimation() {
        const envRenderer = this.view.renderer.animationRenderer.environmentRenderer
        const dataRenderers = envRenderer.getAllChildRenderers()

        for (const [id, renderer] of Object.entries(dataRenderers)) {
            if (renderer instanceof ArrayRenderer || renderer instanceof ObjectRenderer) {
                continue
            }

            const copy = renderer.element.cloneNode(true) as HTMLElement
            const bbox = renderer.element.getBoundingClientRect()
            copy.classList.remove('selected')
            copy.style.position = 'absolute'
            copy.style.left = `${bbox.left}px`
            copy.style.top = `${bbox.top}px`

            document.body.appendChild(copy)

            this.toAnimate.push({
                id,
                el: copy,
            })
        }

        // const copy = envRenderer.element.cloneNode(true) as HTMLElement

        // document.body.appendChild(copy)
        // copy.style.position = 'absolute'
        // copy.style.left = `${bbox.left}px`
        // copy.style.top = `${bbox.top}px`

        // Play: animate the final element from its first bounds
        // to its last bounds (which is no transform)
        //     elm.animate(
        //         [
        //             {
        //                 transformOrigin: 'top left',
        //                 transform: `
        //   translate(${deltaX}px, ${deltaY}px)
        //   scale(${deltaW}, ${deltaH})
        // `,
        //             },
        //             {
        //                 transformOrigin: 'top left',
        //                 transform: 'none',
        //             },
        //         ],
        //         {
        //             duration: 300,
        //             easing: 'ease-in-out',
        //             fill: 'both',
        //         }
        //     )
    }

    performAnimation() {
        const leaves = getLeavesOfView(this.view)

        for (let i = leaves.length - 1; i >= 0; i--) {
            const envRenderer = leaves[i].renderer.animationRenderer.environmentRenderer
            const dataRenderers = envRenderer.getAllChildRenderers()

            for (let j = this.toAnimate.length - 1; j >= 0; j--) {
                const animate = this.toAnimate[j]
                if (dataRenderers[animate.id] != null) {
                    const target = dataRenderers[animate.id].element.getBoundingClientRect()
                    const current = animate.el.getBoundingClientRect()
                    dataRenderers[animate.id].element.classList.add('hidden')

                    setInterval(() => {
                        dataRenderers[animate.id].element.classList.remove('hidden')
                        animate.el.remove()
                    }, 400)

                    const deltaX = target.left - current.left
                    const deltaY = target.top - current.top

                    animate.el.animate(
                        [
                            {
                                transformOrigin: 'top left',
                                transform: 'none',
                            },
                            {
                                transformOrigin: 'top left',
                                transform: `translate(${deltaX}px, ${deltaY}px)`,
                            },
                        ],
                        {
                            duration: 300,
                            easing: 'ease-in-out',
                            fill: 'both',
                        }
                    )
                    // setInterval(() => {
                    //     animate.el.remove()
                    // }, 300)

                    this.toAnimate.splice(j, 1)
                }
            }
        }

        for (const animate of this.toAnimate) {
            animate.el.animate(
                [
                    {
                        opacity: '1',
                    },
                    {
                        opacity: '0',
                    },
                ],
                {
                    duration: 300,
                    easing: 'ease-in-out',
                    fill: 'both',
                }
            )
            setInterval(() => {
                // dataRenderers[animate.id].element.classList.remove('hidden')
                // animate.el.remove()
            }, 300)
        }
    }

    createStepsEmptySteps() {
        const { state, renderer } = this.view
        state.isShowingSteps = true

        renderer.stepsContainer.classList.remove('hidden')

        this.view.stepsTimeline = new Timeline(this.view)
        this.view.stepsTimeline.anchorToView(this.view)

        renderer.element.classList.add('showing-steps')
    }

    createSteps(expanded: boolean = false, animate = false) {
        let start = performance.now()

        const { state, renderer } = this.view

        if (animate) {
            // TODO: Create a lookup table that is used when creating data renderers
            this.detachForAnimation()
        }

        const initBodyBboxes = Object.values(this.view.animationPlayer.renderer.events).map(
            (view) => view.renderer.viewBody.getBoundingClientRect()
        )

        const initLabelBboxes = Object.values(this.view.animationPlayer.renderer.events).map(
            (view) => view.renderer.preLabel.getBoundingClientRect()
        )

        this.createStepsEmptySteps()

        if (instanceOfExecutionGraph(this.view.originalExecution)) {
            const views = Object.values(this.view.animationPlayer.renderer.events)

            for (let i = 0; i < views.length; i++) {
                const view = views[i]
                view.controller.makeNotEmbedded()
                view.controller.expand(true)

                this.view.stepsTimeline.addView(view)

                flipAnimate(
                    view.renderer.viewBody,
                    initBodyBboxes[i],
                    view.renderer.viewBody.getBoundingClientRect()
                )
                flipAnimate(
                    view.renderer.preLabel,
                    initLabelBboxes[i],
                    view.renderer.preLabel.getBoundingClientRect()
                )
            }
        }

        if (animate) {
            setTimeout(() => this.performAnimation(), 100)
        }

        this.collapse()

        console.log(`Created steps in ${performance.now() - start}ms`)

        if (state.isSelected) {
            // this.view.stepsTimeline.select()
        }
    }

    destroySteps() {
        const { state, renderer } = this.view
        state.isShowingSteps = false

        renderer.stepsContainer.classList.add('hidden')

        this.view.stepsTimeline?.destroy(false)
        this.view.stepsTimeline = null

        this.expand()

        // const initBodyBboxes = Object.values(this.view.animationPlayer.renderer.events).map(
        //     (view) => view.renderer.viewBody.getBoundingClientRect()
        // )

        // const initLabelBboxes = Object.values(this.view.animationPlayer.renderer.events).map(
        //     (view) => view.renderer.preLabel.getBoundingClientRect()
        // )

        // Put the views back to the right spot
        if (instanceOfExecutionGraph(this.view.originalExecution)) {
            const views = Object.values(this.view.animationPlayer.renderer.events)

            for (let i = 0; i < views.length; i++) {
                const view = views[i]
                const bodyBbox = view.renderer.viewBody.getBoundingClientRect()
                const labelBbox = view.renderer.preLabel.getBoundingClientRect()
                view.controller.collapse()
                view.controller.makeEmbedded()

                this.view.animationPlayer.renderer.anchorView(view)
                // flipAnimate(
                //     view.renderer.viewBody,
                //     bodyBbox,
                //     view.renderer.viewBody.getBoundingClientRect()
                // )
                // flipAnimate(
                //     view.renderer.preLabel,
                //     labelBbox,
                //     view.renderer.preLabel.getBoundingClientRect()
                // )

                // setTimeout(() => {
                //     flipAnimate(
                //         view.renderer.viewBody,
                //         initBodyBboxes[i],
                //         view.renderer.viewBody.getBoundingClientRect()
                //     )
                // }, 100)
                // flipAnimate(
                //     view.renderer.preLabel,
                //     initLabelBboxes[i],
                //     view.renderer.preLabel.getBoundingClientRect()
                // )
            }
        }

        this.view.renderer.stepsContainer.innerHTML = ''
        renderer.element.classList.remove('showing-steps')
    }

    updateDepth() {
        if (Executor.instance.rootView.parentView == null) {
            return
        }

        let delta = Math.abs(
            getDepthOfView(this.view, Executor.instance.rootView.parentView) -
                Executor.instance.rootView.currentDepth
        )

        let playingAnimation =
            this.view.state.isEmbedded && this.view.renderer.element.classList.contains('playing')

        if (
            (delta < 2 && !this.view.state.isEmbedded) ||
            playingAnimation ||
            this.isDraggingEmbedded
        ) {
            // Should exist but can be faded out
            if (this.temporaryCodeQuery.isHidden) {
                this.temporaryCodeQuery.show()
            }

            if (this.view.state.isEmbedded) {
                if (playingAnimation) {
                    this.temporaryCodeQuery.select(false)
                } else {
                    this.temporaryCodeQuery.deselect()
                }
            }
        } else {
            // Should not exist
            if (!this.temporaryCodeQuery.isHidden) {
                this.temporaryCodeQuery.hide()
            }
        }
    }

    showTrace() {
        const { state, renderer } = this.view
        state.isShowingTrace = true

        if (state.isShowingSteps) {
            renderer.globalTrace.show()
        } else {
            renderer.animationRenderer?.showTrace()
            renderer.trace.show()
        }
    }

    hideTrace() {
        const { state, renderer } = this.view
        state.isShowingTrace = false

        if (state.isShowingSteps) {
            renderer.globalTrace.hide()
        } else {
            renderer.animationRenderer?.hideTrace(!state.isSeparated)
            renderer.trace.hide()
        }
    }

    tick(dt: number) {
        const { state, renderer } = this.view

        this.view.animationPlayer?.tick(dt)

        if (
            this.view.animationPlayer != null &&
            state.isPlayingAnimation &&
            this.view.animationPlayer.hasEnded
        ) {
            this.stopAnimation()
        }

        this.controlFlow?.tick(dt)

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

        // Update w.r.t. depth
        this.updateDepth()

        // Update attachment
        if (this.attachedTo != null && document.body.contains(this.attachedTo)) {
            const attachBbox = this.attachedTo.getBoundingClientRect()
            const bbox = this.view.renderer.element.getBoundingClientRect()

            state.transform.position.x = lerp(
                state.transform.position.x,
                attachBbox.left + attachBbox.width + 40,
                0.2
            )
            state.transform.position.y = lerp(
                state.transform.position.y,
                attachBbox.top + attachBbox.height / 2 - bbox.height / 2,
                0.2
            )
        }
    }

    attachTo(element: HTMLElement, instantTransform = true) {
        const { state, renderer } = this.view

        this.attachedTo = element

        const attachBbox = this.attachedTo.getBoundingClientRect()
        const bbox = this.view.renderer.element.getBoundingClientRect()

        if (instantTransform) {
            state.transform.position.x = attachBbox.left + attachBbox.width + 40
            state.transform.position.y = attachBbox.top + attachBbox.height / 2 - bbox.height / 2
        }
    }

    detach() {
        this.attachTo = null
    }

    makeTemporary() {
        const { state, renderer } = this.view
        state.isTemporary = true

        renderer.element.classList.add('temporary')
    }

    makeFixed() {
        const { state, renderer } = this.view
        state.isTemporary = false

        renderer.element.classList.remove('temporary')
    }

    bindMouseEvents() {
        // Bind mouse events to label
        const node = this.view.renderer.label

        node.addEventListener('mousedown', this.mousedown.bind(this))
        node.addEventListener('mouseover', this.mouseover.bind(this))
        node.addEventListener('mouseout', this.mouseout.bind(this))

        document.body.addEventListener('mouseup', this.mouseup.bind(this))
        document.body.addEventListener('mousemove', this.mousemove.bind(this))

        this.view.renderer.viewBody.addEventListener('mousedown', this.mousedownBody.bind(this))
    }

    mousedownBody(e: MouseEvent) {
        const { state, renderer } = this.view

        this.startMouse = {
            x: e.x,
            y: e.y,
        }

        this.previousMouse = {
            x: e.x,
            y: e.y,
        }

        if (this.view.state.isEmbedded) {
            renderer.element.classList.add('embedded-dragging')
            this.isDraggingEmbedded = true

            this.setAnchored()
        }
    }

    setAnchored() {
        // Re-route query to anchor
        this.temporaryCodeQuery.setAnchor(this.view.renderer.element.previousSibling as HTMLElement)
        this.isAnchored = true
        this.view.renderer.element.classList.add('is-anchored')
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

        if (this.view.state.isEmbedded && this.isDraggingEmbedded) {
            renderer?.element.classList.remove('embedded-dragging')
            this.isDraggingEmbedded = false
            const bbox = renderer.viewBody.getBoundingClientRect()

            this.makeFloating()
            this.view.renderer.viewBody.style.transform = 'inherit'
            this.view.state.transform.position.x =
                bbox.left - Executor.instance.rootView.separatorPosition - 50
            this.view.state.transform.position.y = bbox.top - 50
            this.view.renderer.updatePosition(1)
            this.makeNotEmbedded()
            this.expand(true)

            flipAnimate(
                this.view.renderer.viewBody,
                bbox,
                this.view.renderer.viewBody.getBoundingClientRect()
            )
        }
    }

    makeFloating() {
        Executor.instance.rootView.panningArea.addView(this.view)
        this.view.renderer.element.classList.add('floating')
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

        if (this.view.state.isEmbedded && this.isDraggingEmbedded) {
            this.view.renderer.viewBody.style.transform = `translate(${
                mouse.x - this.startMouse.x
            }px, ${mouse.y - this.startMouse.y}px)`
        }
    }

    mouseover(e: MouseEvent) {
        const bbox = Editor.instance.computeBoundingBoxForLoc(
            this.view.originalExecution.nodeData.location
        )
        const paddingX = 20
        const paddingY = 10

        bbox.x -= paddingX
        bbox.y -= paddingY
        bbox.width += paddingX * 2
        bbox.height += paddingY * 2

        this.temporaryCodeQuery?.select(false)
        this.view.animationPlayer?.revealLabels()
    }

    mouseout(e: MouseEvent) {
        this.temporaryCodeQuery?.deselect()
        this.view.animationPlayer?.hideLabels()
    }

    click() {
        if (!instanceOfExecutionGraph(this.view.originalExecution)) return

        const { renderer, state } = this.view
        if (state.isShowingSteps) {
            this.destroySteps()
        } else {
            this.createSteps(!state.isCollapsed, false)
        }
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

    expand(initial = false) {
        const { state, renderer } = this.view

        if (state.isCollapsed != null && !state.isCollapsed && !initial) {
            console.warn("Trying to expand a node that's not collapsed")
            return
        }

        state.isCollapsed = false

        renderer.element.classList.remove('collapsed')
        renderer.controlElement.classList.remove('disabled')

        renderer.stepsContainer.classList.add('expanded')

        this.view.renderer.animationRenderer = new AnimationRenderer(this.view)
        this.view.renderer.viewBody.appendChild(this.view.renderer.animationRenderer.element)

        this.view.renderer.animationRenderer.update()
    }

    makeEmbedded() {
        this.view.renderer.element.classList.add('embedded')
        this.view.state.isEmbedded = true

        this.view.animationPlayer?.destroy()
        this.view.animationPlayer = null

        console.log('Making embedded', this.view.id)
    }

    makeNotEmbedded() {
        this.view.renderer.element.classList.remove('embedded')
        this.view.state.isEmbedded = false

        this.view.animationPlayer = new AnimationPlayer(this.view)

        this.view.state.isCollapsed = false
    }

    onRendererBodyEnter() {}

    onRendererBodyLeave() {}

    collapse(initial = false) {
        const { state, renderer } = this.view

        if (state.isCollapsed && !initial) {
            console.warn("Trying to collapse a node that's already collapsed")
            return
        }

        state.isCollapsed = true

        renderer.element.classList.add('collapsed')
        renderer.controlElement.classList.add('disabled')

        renderer.stepsContainer.classList.remove('expanded')

        this.view.renderer.animationRenderer?.destroy()
        this.view.renderer.animationRenderer = null
    }
}
