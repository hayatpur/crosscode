import { Editor } from '../../editor/Editor'
import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
import { Executor } from '../../executor/Executor'
import { createEl } from '../../utilities/dom'
import { Action } from './Action'

export class ActionInteractionArea {
    element: HTMLElement

    parentAction: Action
    execution: ExecutionNode | ExecutionGraph = null

    temporaryAction: Action = null

    /* ----------------------- Create ----------------------- */
    constructor(parentAction: Action, execution: ExecutionNode | ExecutionGraph) {
        this.parentAction = parentAction
        this.execution = execution

        this.create()

        let clicked = false

        let timer = 0

        // Focus
        this.element.addEventListener('mouseenter', (e) => {
            if (!clicked) {
                Executor.instance.visualization.focus.focusOn(this.execution)

                this.temporaryAction = new Action(execution, {
                    isRoot: true,
                    shouldShowSteps: true,
                    shouldExpand: true,
                    origin: this.parentAction.renderer.label,
                })
                const camera = Executor.instance.visualization.camera
                camera.add(this.temporaryAction.renderer.element)

                const bbox = parentAction.renderer.element.getBoundingClientRect()
                const vizBbox = Executor.instance.visualization.element.getBoundingClientRect()

                this.temporaryAction.state.transform.position.x =
                    bbox.x + bbox.width - vizBbox.x - camera.state.position.x + 100

                const newBbox = this.temporaryAction.renderer.element.getBoundingClientRect()
                this.temporaryAction.state.transform.position.y =
                    bbox.y + bbox.height / 2 - newBbox.height / 2

                // setTimeout(() => {
                //     const bbox = parentAction.renderer.element.getBoundingClientRect()
                //     const newBbox = this.temporaryAction.renderer.element.getBoundingClientRect()
                //     this.temporaryAction.state.transform.position.y =
                //         bbox.y + bbox.height / 2 - newBbox.height / 2
                // }, 500)

                this.temporaryAction.controller.minimize()

                // clicked = true
                setTimeout(() => {
                    Executor.instance.visualization.focus.updateFocus()
                }, 200)
            }
        })

        this.element.addEventListener('mouseleave', (e) => {
            if (!clicked) {
                Executor.instance.visualization.focus.clearFocus(this.execution)
                this.temporaryAction?.destroy()
            }
        })

        // Click
        this.element.addEventListener('click', (e) => {
            const camera = Executor.instance.visualization.camera
            camera.state.position.x = -this.temporaryAction.state.transform.position.x + 300
            // camera.state.position.y = -this.temporaryAction.state.transform.position.y + 300

            this.temporaryAction.controller.maximize()

            clicked = true
            setTimeout(() => {
                Executor.instance.visualization.focus.updateFocus()
            }, 200)

            Executor.instance.visualization.minimap.addAction(this.temporaryAction)

            // camera.state.position.y = -(newAction.state.transform.position.y) + 300
        })
    }

    create() {
        this.element = createEl('div', 'action-interaction-area')
        this.parentAction.renderer.header.appendChild(this.element)

        const loc = this.execution.nodeData.location
        let bbox = Editor.instance.computeBoundingBoxForLoc(loc)

        let parentBbox = Editor.instance.computeBoundingBoxForLoc(
            this.parentAction.execution.nodeData.location
        )

        const parentLoc = this.parentAction.execution.nodeData.location

        if (parentLoc.end.line - parentLoc.start.line > 1) {
            if (this.execution.id == this.parentAction.execution.id) {
                bbox = this.parentAction.renderer.label.getBoundingClientRect()
                parentBbox = bbox
            } else {
                return
            }
        }

        const paddingX = 5
        const paddingY = 2

        // Set size
        this.element.style.width = `${bbox.width + paddingX * 2}px`
        this.element.style.height = `${bbox.height + paddingY * 2}px`

        // Set position relative to parent
        this.element.style.left = `${bbox.x - parentBbox.x - paddingX}px`
        this.element.style.top = `${bbox.y - parentBbox.y - paddingY}px`
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        this.element.remove()
    }
}
