import * as monaco from 'monaco-editor'
import { Editor } from '../../editor/Editor'
import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode, instanceOfExecutionNode } from '../../execution/primitive/ExecutionNode'
import { createEl } from '../../utilities/dom'
import { Action } from './Action'

/* ------------------------------------------------------ */
/*                     Action Renderer                    */
/* ------------------------------------------------------ */
export class ActionRenderer {
    // Parent element
    element: HTMLElement

    // Header
    header: HTMLElement
    label: HTMLElement
    preLabel: HTMLElement
    controls: HTMLElement

    // Controls

    // Body contains a timeline
    body: HTMLElement

    /* ----------------------- Create ----------------------- */

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

        // Controls

        // Body
        this.body = createEl('div', 'action-body', this.element)
    }

    /* ----------------------- Render ----------------------- */

    render(action: Action) {
        // Set label
        this.preLabel.innerHTML = action.execution.nodeData.preLabel ?? ''
        setSourceCodeOfExecution(action.execution, this.label)

        // Set classes
        action.timeline.state.isCollapsed
            ? this.element.classList.remove('expanded')
            : this.element.classList.add('expanded')

        action.timeline.state.isShowingSteps
            ? this.element.classList.add('showing-steps')
            : this.element.classList.remove('showing-steps')
    }

    /* ----------------------- Destroy ---------------------- */

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

/* ------------------------------------------------------ */
/*                         Helpers                        */
/* ------------------------------------------------------ */

function getLabelOfExecution(execution: ExecutionGraph | ExecutionNode) {
    return (instanceOfExecutionNode(execution) ? execution.name : execution.nodeData.type)
        .replace(/([A-Z])/g, ' $1')
        .trim()
}

function setSourceCodeOfExecution(execution: ExecutionGraph | ExecutionNode, element: HTMLElement) {
    const range = execution.nodeData.location
    let label = Editor.instance.monaco.getModel().getValueInRange({
        startLineNumber: range.start.line,
        startColumn: range.start.column + 1,
        endLineNumber: range.end.line,
        endColumn: range.end.column + 1,
    })

    if (range.end.line - range.start.line > 0) {
        if (
            execution.nodeData.type == 'FunctionDeclaration' ||
            execution.nodeData.type == 'FunctionCall' ||
            execution.nodeData.type == 'ForStatement' ||
            execution.nodeData.type == 'WhileStatement' ||
            execution.nodeData.type == 'IfStatement'
        ) {
            let upTill = label.substring(0, label.indexOf('{')).trim()
            label = `${upTill} { ... }`
        } else {
            label = `{ ... }`
        }
    } else {
        label = Editor.instance.monaco.getModel().getValueInRange({
            startLineNumber: range.start.line,
            startColumn: range.start.column + 1,
            endLineNumber: range.end.line,
            endColumn: range.end.column + 1,
        })
    }

    monaco.editor.colorize(label, 'javascript', {}).then((result) => (element.innerHTML = result))
}
