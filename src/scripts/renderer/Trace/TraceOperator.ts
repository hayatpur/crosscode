import { Editor } from '../../editor/Editor'
import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode, instanceOfExecutionNode } from '../../execution/primitive/ExecutionNode'
import { Executor } from '../../executor/Executor'
import { CodeQueryGroup } from '../Query/CodeQuery/CodeQueryGroup'

export class TraceOperator {
    element: HTMLElement
    execution: ExecutionNode | ExecutionGraph

    codeSelectionElement: HTMLElement
    query: CodeQueryGroup

    private _listeners: []

    constructor(execution: ExecutionNode | ExecutionGraph) {
        this.execution = execution

        this.element = document.createElement('div')
        this.element.classList.add('trace-interactable')

        let label = ''

        if (execution != null) {
            label += (instanceOfExecutionNode(execution) ? execution.name : execution.nodeData.type)
                .replace(/([A-Z])/g, ' $1')
                .trim()
        } else {
            label = 'Unknown'
        }

        this.element.innerHTML = `<span class="trace-tooltip-text">${label}</span>`
        document.body.append(this.element)

        // Create code selection
        this.codeSelectionElement = document.createElement('div')
        this.codeSelectionElement.classList.add('code-selection')
        document.body.appendChild(this.codeSelectionElement)

        this.bindMouseEvents()
    }

    bindMouseEvents() {
        // Bind mouse events to label
        const node = this.element

        node.addEventListener('mousedown', this.mousedown.bind(this))
        node.addEventListener('mouseover', this.mouseover.bind(this))
        node.addEventListener('mouseout', this.mouseout.bind(this))

        // document.body.addEventListener('mouseup', this.mouseup.bind(this))
        // document.body.addEventListener('mousemove', this.mousemove.bind(this))
    }

    tick(dt: number) {
        if (this.codeSelectionElement != null) {
            this.updateCodeSelection()
        }
    }

    updateCodeSelection() {
        const codeBbox = Editor.instance.computeBoundingBoxForLoc(this.execution.nodeData.location)
        const padding = 4
        this.codeSelectionElement.style.left = `${codeBbox.x - padding}px`
        this.codeSelectionElement.style.top = `${codeBbox.y - padding / 2}px`
        this.codeSelectionElement.style.width = `${codeBbox.width + padding * 2}px`
        this.codeSelectionElement.style.height = `${codeBbox.height + padding}px`
    }

    mousedown(event: MouseEvent) {
        // Create code query
    }

    mouseover(event: MouseEvent) {
        // Show code query
        // this.codeSelectionElement = document.createElement('div')
        // this.codeSelectionElement.classList.add('code-selection')
        // document.body.appendChild(this.codeSelectionElement)
        this.codeSelectionElement.classList.add('selected')

        this.query?.destroy()
        this.query = Executor.instance.rootView.createCodeQueryGroup({
            selection: null,
            executionIds: [this.execution.id],
        })
    }

    mouseout(event: MouseEvent) {
        // Destroy code query
        this.codeSelectionElement.classList.remove('selected')

        this.query?.destroy()
        this.query = null
        // this.codeSelectionElement.remove()
    }

    mouseup(event: MouseEvent) {}

    mousemove(event: MouseEvent) {}

    destroy() {
        this.element.remove()
        this.element = null

        this.codeSelectionElement?.remove()
        this.codeSelectionElement = null
    }
}
