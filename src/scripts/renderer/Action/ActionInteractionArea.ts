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

    createdSteps: boolean = false

    /* ----------------------- Create ----------------------- */
    constructor(parentAction: Action, execution: ExecutionNode | ExecutionGraph) {
        this.parentAction = parentAction
        this.execution = execution

        this.create()

        // Focus
        this.element.addEventListener('mouseenter', (e) => {
            // if (!this.createdSteps) {
            Executor.instance.visualization.focus.focusOn(this.execution)
            // }
        })

        this.element.addEventListener('mouseleave', (e) => {
            // if (!this.createdSteps) {
            Executor.instance.visualization.focus.clearFocus(this.execution)
            // }
        })

        // Click
        let timer: number
        this.element.addEventListener('click', (event) => {
            // if (event.detail === 1) {
            //     timer = setTimeout(() => {
            //         this.clicked()
            //     }, 200)
            // }
            this.clicked()
        })
        this.element.addEventListener('dblclick', (event) => {
            // clearTimeout(timer)
            // this.doubleClicked()
        })
    }

    clicked() {
        // if (this.createdSteps) {
        //     this.parentAction.controller.destroyStepsAndViews()
        //     this.createdSteps = false
        //     return
        // }

        if (this.execution.id == this.parentAction.execution.id) {
            this.parentAction.representation.cycle()
        }
        //  else {
        //     this.temporaryAction = this.parentAction.controller.createFocusedStep(this.execution)
        // }

        // this.createdSteps = true
    }

    doubleClicked() {
        // this.temporaryAction = this.parentAction.controller.createOutgoingStep(this.execution)
        // this.createdSteps = true
    }

    create() {
        this.element = createEl('div', 'action-interaction-area')

        // Parent has been destroyed
        if (this.parentAction.renderer == null) {
            return
        }

        this.parentAction.renderer.header.appendChild(this.element)

        const loc = this.execution.nodeData.location
        let bbox = Editor.instance.computeBoundingBoxForLoc(loc)

        let parentBbox = Editor.instance.computeBoundingBoxForLoc(
            this.parentAction.execution.nodeData.location
        )

        // Label offset
        const labelBbox = this.parentAction.renderer.headerLabel.getBoundingClientRect()
        const headerBbox = this.parentAction.renderer.header.getBoundingClientRect()
        const labelOffset = labelBbox.x - headerBbox.x

        const parentLoc = this.parentAction.execution.nodeData.location

        if (this.execution.id == this.parentAction.execution.id) {
            this.element.classList.add('itself')
        }

        if (parentLoc.end.line - parentLoc.start.line > 1) {
            if (this.execution.id == this.parentAction.execution.id) {
                bbox = this.parentAction.renderer.headerLabel.getBoundingClientRect()
                parentBbox = bbox
            } else {
                return
            }
        }

        const paddingX = 0
        const paddingY = 0

        // Set size
        this.element.style.width = `${bbox.width + paddingX * 2}px`
        this.element.style.height = `${bbox.height + paddingY * 2}px`

        // Set position relative to parent
        this.element.style.left = `${bbox.x - parentBbox.x - paddingX + labelOffset}px`
        this.element.style.top = `${bbox.y - parentBbox.y - paddingY}px`
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        this.element.remove()
    }
}
