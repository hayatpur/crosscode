import { Editor } from '../../editor/Editor'
import { queryExecutionGraph } from '../../execution/execution'
import { ExecutionGraph, instanceOfExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
import { Executor } from '../../executor/Executor'
import { getAllSteps, isExpandable } from '../../utilities/action'
import { Ticker } from '../../utilities/Ticker'
import { View } from '../View/View'
import { Action } from './Action'

/* ------------------------------------------------------ */
/*           Defines interactions with an Action          */
/* ------------------------------------------------------ */
export class ActionController {
    action: Action
    _tickerId: string

    connections: SVGPathElement[] = []

    constructor(action: Action) {
        this.action = action

        this.bindMouseEvents()

        this._tickerId = Ticker.instance.registerTick(this.tick.bind(this))

        if (isExpandable(action.execution)) {
            action.renderer.expandButton.innerHTML = `<ion-icon name="chevron-forward-outline"></ion-icon>`

            action.renderer.expandButton.addEventListener('click', () => {
                this.action.representation.cycle()
            })
        }

        this.action.renderer.expandButton?.addEventListener('click', () => {
            if (this.action.steps.length > 0) {
                this.destroyStepsAndViews()
            } else {
                this.createSteps()
            }
        })
    }

    /* -------------------- Toggle views -------------------- */
    showView() {
        this.action.state.isShowingView = true

        this.action.renderer.render(this.action)
    }

    hideView() {
        this.action.state.isShowingView = false

        this.action.renderer.render(this.action)
    }

    /* ----------------------- Update ----------------------- */
    tick(dt: number) {
        // Update position if root
        if (!this.action.state.inline) {
            const { x, y } = this.action.state.position
            this.action.renderer.element.style.left = `${x}px`
            this.action.renderer.element.style.top = `${y}px`
        }

        if (this.action.state.isFocusedStep) {
            const { x, y } = this.action.state.position
            this.action.renderer.element.style.marginLeft = `${x}px`
        }

        // Attach line numbers to root
        if (this.action.state.inline) {
            const root = this.action.controller.getSpatialRoot()
            const rootBody = root.renderer.stepContainer.getBoundingClientRect()
            const thisBody = this.action.renderer.element.getBoundingClientRect()
            const delta = rootBody.x - thisBody.x
            this.action.renderer.headerPreLabel.style.transform = `translateX(${delta + 15}px)`
            this.action.renderer.footerPreLabel.style.transform = `translateX(${delta + 15}px)`
        }
    }

    /* ------------------------ Step ------------------------ */
    createSteps() {
        this.action.steps = []

        let steps = getExecutionSteps(this.action.execution)

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i]

            // Compute any line difference
            let delta = 0
            if (i < steps.length - 1) {
                let currEnd = step.nodeData.location.end.line
                let nextStart = steps[i + 1].nodeData.location.start.line
                delta = Math.min(Math.max(nextStart - currEnd - 1, 0), 1)
            }

            const action = new Action(step, this.action, {
                spacingDelta: delta,
                inline: true,
            })
            this.action.steps.push(action)
        }

        // Add a view if not inline
        if (this.action.state.inline) {
            const root = this.getSpatialRoot()
            root.controller.updateStepToViewMappings()
        } else {
            this.updateStepToViewMappings()
        }

        // Render them so they're in the right place
        this.action.renderer.render(this.action)
    }

    updateStepToViewMappings() {
        const allSteps = getAllSteps(this.action)

        for (const view of this.action.views) {
            view.controller.clearExecutions()
        }

        for (const step of allSteps) {
            // if (step instanceof ActionBundle) continue
            if (step.steps.length > 0) continue

            // Put it in the corresponding view
            for (const view of this.action.views) {
                for (const potentialExecution of view.representingExecutions) {
                    if (
                        queryExecutionGraph(
                            potentialExecution,
                            (child) => child.id == step.execution.id
                        )
                    ) {
                        view.controller.addExecution(step.execution)
                        break
                    }
                }
            }
        }
    }

    getRoot() {
        let root = this.action
        while (root.parent != null) {
            root = root.parent
        }
        return root
    }

    getSpatialRoot() {
        let root = this.action
        while (root.parent != null && root.state.inline) {
            root = root.parent
        }
        return root
    }

    createView(representingExecutions: (ExecutionGraph | ExecutionNode)[] = null) {
        if (representingExecutions == null) {
            representingExecutions = [this.action.execution]
        }

        const view = new View()
        view.representingExecutions = representingExecutions

        this.action.views.push(view)

        // Render again
        this.action.renderer.render(this.action)
        return view
    }

    destroyStepsAndViews() {
        // Destroy steps
        this.action.steps?.forEach((step) => step.destroy())
        this.action.steps = []

        // Destroy views
        this.action.views?.forEach((view) => view.destroy())
        this.action.views = []

        // Render again
        this.action.renderer.render(this.action)
    }

    removeStep(step: Action) {
        const index = this.action.steps.indexOf(step)
        console.log(index)
        if (index > -1) {
            this.action.steps.splice(index, 1)
        }

        // Render again
        this.action.renderer.render(this.action)
    }

    /* -------------------- Focused steps ------------------- */
    createFocusedStep(execution: ExecutionGraph | ExecutionNode) {
        this.destroyStepsAndViews()
        const step = new Action(execution, this.action, {
            spacingDelta: 0,
            inline: true,
            isFocusedStep: true,
        })
        step.controller.createSteps()

        this.action.renderer.element.classList.add('showing-focused-step')

        this.action.steps.push(step)
        this.action.renderer.render(this.action)

        return step
    }

    destroyFocusedStep() {
        this.destroyStepsAndViews()
    }

    /* ------------------- Outgoing steps ------------------- */
    createOutgoingStep(execution: ExecutionGraph | ExecutionNode) {
        const step = new Action(execution, this.action, {
            spacingDelta: 0,
            inline: false,
        })
        step.controller.createSteps()

        this.action.controller.getSpatialRoot().controller.hideView()
        this.action.steps.push(step)
        this.action.renderer.render(this.action)

        Executor.instance.visualization.camera.add(step.renderer.element)

        return step
    }

    destroyOutgoingStep(step: Action) {
        step.destroy()
        this.action.steps.splice(this.action.steps.indexOf(step), 1)
        this.action.renderer.render(this.action)
    }

    /* ------------------------ Focus ----------------------- */
    focus(node?: ExecutionGraph | ExecutionNode) {
        this.action.renderer.element.classList.remove('unfocused')
        this.action.renderer.element.classList.add('is-focused')

        if (node != null) {
            const loc = node.nodeData.location
            const bbox = Editor.instance.computeBoundingBoxForLoc(loc)
            const parentBbox = Editor.instance.computeBoundingBoxForLoc(
                this.action.execution.nodeData.location
            )
            bbox.x -= parentBbox.x
            bbox.y -= parentBbox.y

            let padding = 20
            bbox.x -= padding
            bbox.y -= padding
            bbox.width += 2 * padding
            bbox.height += 2 * padding

            const headerBbox = this.action.renderer.headerLabel.getBoundingClientRect()

            const tokens = [
                ...this.action.renderer.header.querySelectorAll('.action-label > span > span'),
            ]
            const contained = tokens.filter((token) => {
                const tokenBbox = token.getBoundingClientRect()
                tokenBbox.x -= headerBbox.x
                tokenBbox.y -= headerBbox.y
                return (
                    tokenBbox.x >= bbox.x &&
                    tokenBbox.y >= bbox.y &&
                    tokenBbox.x + tokenBbox.width <= bbox.x + bbox.width &&
                    tokenBbox.y + tokenBbox.height <= bbox.y + bbox.height
                )
            })
            for (const el of contained) {
                el.classList.remove('unfocused')
            }
        } else {
            const tokens = [
                ...this.action.renderer.header.querySelectorAll('.action-label > span > span'),
            ]
            for (const el of tokens) {
                el.classList.remove('unfocused')
            }
        }
    }

    unfocus() {
        this.action.renderer.element.classList.add('unfocused')

        this.action.renderer.element.classList.add('is-focused')

        const tokens = [
            ...this.action.renderer.header.querySelectorAll('.action-label > span > span'),
        ]

        for (const el of tokens) {
            el.classList.add('unfocused')
        }
    }

    clearFocus() {
        this.action.renderer.element.classList.remove('unfocused')
        this.action.renderer.element.classList.remove('is-focused')

        const tokens = [
            ...this.action.renderer.header.querySelectorAll('.action-label > span > span'),
        ]
        for (const el of tokens) {
            el.classList.remove('unfocused')
        }
    }

    /* -------------------- Mouse events -------------------- */

    bindMouseEvents() {
        // Bind mouse events to label
        const node = this.action.renderer.headerLabel

        node.addEventListener('mousedown', this.mousedown.bind(this))
        node.addEventListener('mouseover', this.mouseover.bind(this))
        node.addEventListener('mouseout', this.mouseout.bind(this))

        node.addEventListener('click', this.click.bind(this))

        document.body.addEventListener('mouseup', this.mouseup.bind(this))
        document.body.addEventListener('mousemove', this.mousemove.bind(this))
    }

    click(e: MouseEvent) {
        // if (this.action.steps.length == 0) {
        //     this.createSteps()
        // } else {
        //     this.destroySteps()
        // }
    }

    mousedown(event: MouseEvent) {}

    mouseover(event: MouseEvent) {}

    mouseout(event: MouseEvent) {}

    mouseup(event: MouseEvent) {}

    mousemove(event: MouseEvent) {}

    /* ----------------------- Destroy ---------------------- */

    destroy() {
        Ticker.instance.removeTickFrom(this._tickerId)

        this.connections.forEach((connection) => {
            connection.remove()
        })
    }
}

/* ------------------------------------------------------ */
/*                    Helper functions                    */
/* ------------------------------------------------------ */
// ? Apply blacklist
export function getExecutionSteps(
    execution: ExecutionGraph | ExecutionNode
): (ExecutionGraph | ExecutionNode)[] {
    if (instanceOfExecutionGraph(execution)) {
        return execution.vertices
    } else {
        return []
    }
}

export function functionCallReturns(execution: ExecutionGraph | ExecutionNode) {
    // TODO
    return true
}
