import { Editor } from '../../editor/Editor'
import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
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

        this.element = createEl('div', 'action-interaction-area')
        this.parentAction.renderer.header.appendChild(this.element)

        // Click
        this.element.addEventListener('click', (e: MouseEvent) => {
            this.clicked(e)
        })

        // Hover
        this.element.addEventListener('mouseenter', (e: MouseEvent) => {
            this.parentAction.proxy.element.classList.add('is-hovering')
        })

        this.element.addEventListener('mouseleave', (e: MouseEvent) => {
            this.parentAction.proxy.element.classList.remove('is-hovering')
        })
    }

    clicked(e: MouseEvent) {}

    tick(dt: number) {
        // Parent has been destroyed
        if (this.parentAction.renderer == null) {
            return
        }

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

        console.log(this.parentAction.execution.nodeData.type)

        if (parentLoc.end.line - parentLoc.start.line > 1) {
            if (this.execution.id == this.parentAction.execution.id) {
                bbox = this.parentAction.renderer.headerLabel.getBoundingClientRect()
                const footer = this.parentAction.renderer.footer.getBoundingClientRect()
                bbox.height += footer.y + footer.height - (bbox.y + bbox.height)
                bbox.height -= 6
                parentBbox = bbox
            } else {
                return
            }
        }

        const indentOffset = 20
        if (this.parentAction.state.isIndented) {
            bbox.x += indentOffset
            bbox.width -= indentOffset
        }

        const paddingX = 0
        const paddingY = 0

        // Set size
        this.element.style.width = `${bbox.width + paddingX * 2 + 9}px`
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
