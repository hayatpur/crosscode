import * as monaco from 'monaco-editor'
import { Editor } from '../../editor/Editor'
import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode, instanceOfExecutionNode } from '../../execution/primitive/ExecutionNode'
import { createEl } from '../../utilities/dom'
import { Action } from './Action'

export class ActionRenderer {
    // Parent element
    element: HTMLElement

    // Header
    header: HTMLElement
    label: HTMLElement
    preLabel: HTMLElement
    controls: HTMLElement

    // Body contains a timeline
    body: HTMLElement

    constructor() {
        // Create dom elements
        this.create()
    }

    create() {
        this.element = createEl('div', 'action')

        // Header
        this.header = createEl('div', 'action-header', this.element)
        this.label = createEl('div', 'action-label', this.header)
        this.preLabel = createEl('div', 'action-pre-label', this.header)
        this.controls = createEl('div', 'action-controls', this.header)

        // Body
        this.body = createEl('div', 'action-body', this.element)
    }

    render(action: Action) {
        // Set label
        this.label.innerHTML = getLabelOfExecution(action.execution)
        this.preLabel.innerHTML = action.execution.nodeData.preLabel ?? 'Unknown pre label'

        // Set classes
        action.state.isCollapsed
            ? this.element.classList.add('collapsed')
            : this.element.classList.remove('collapsed')

        action.state.isShowingSteps
            ? this.element.classList.add('showing-steps')
            : this.element.classList.remove('showing-steps')

        action.state.isShowingBeforeAndAfter
            ? this.element.classList.add('showing-before-and-after')
            : this.element.classList.remove('showing-before-and-after')
    }

    destroy() {
        this.element.remove()

        this.element = null
        this.header = null
        this.label = null
        this.preLabel = null
        this.controls = null
        this.body = null
    }
}

function getLabelOfExecution(execution: ExecutionGraph | ExecutionNode) {
    return (instanceOfExecutionNode(execution) ? execution.name : execution.nodeData.type)
        .replace(/([A-Z])/g, ' $1')
        .trim()
}

function setSourceCodeOfExecution(execution: ExecutionGraph | ExecutionNode, element: HTMLElement) {
    const range = execution.nodeData.location
    const label = Editor.instance.monaco.getModel().getValueInRange({
        startLineNumber: range.start.line,
        startColumn: range.start.column + 1,
        endLineNumber: range.end.line,
        endColumn: range.end.column + 1,
    })

    monaco.editor.colorize(label, 'javascript', {}).then((result) => (element.innerHTML = result))
}
