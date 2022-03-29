import * as monaco from 'monaco-editor'
import { Editor } from '../../editor/Editor'
import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode, instanceOfExecutionNode } from '../../execution/primitive/ExecutionNode'
import { Executor } from '../../executor/Executor'
import { createEl } from '../../utilities/dom'
import { getNumericalValueOfStyle } from '../../utilities/math'
import { Action } from './Action'
import { ActionBundle } from './ActionBundle'

/* ------------------------------------------------------ */
/*                     Action Renderer                    */
/* ------------------------------------------------------ */
export class ActionRenderer {
    // Parent element
    element: HTMLElement

    // Header
    header: HTMLElement
    headerLabel: HTMLElement
    headerPreLabel: HTMLElement

    // Footer
    footer: HTMLElement
    footerLabel: HTMLElement
    footerPreLabel: HTMLElement

    // Timeline
    baseElement: HTMLElement

    // Body contains a timeline
    body: HTMLElement

    // Expandable
    expandButton: HTMLElement

    // Controls
    controlsContainer: HTMLElement
    controls: HTMLElement[]

    /* ----------------------- Create ----------------------- */

    constructor() {
        // Create dom elements
        this.create()
    }

    create() {
        this.element = createEl('div', 'action')

        // Header
        this.header = createEl('div', 'action-header', this.element)
        this.headerPreLabel = createEl('div', 'action-pre-label', this.header)
        this.headerLabel = createEl('div', 'action-label', this.header)

        // Body
        this.body = createEl('div', 'action-body', this.element)

        // Timeline
        this.baseElement = createEl('div', 'action-base', this.body)

        // Footer
        this.footer = createEl('div', 'action-footer', this.element)
        this.footerPreLabel = createEl('div', 'action-pre-label', this.footer)
        this.footerLabel = createEl('div', 'action-label', this.footer)

        this.expandButton = createEl('div', 'action-expand-button')

        // Controls
        this.controlsContainer = createEl('div', 'action-controls', this.header)
        this.controls = []
        for (const label of ['A', 'B', 'C', 'D', 'E']) {
            const control = createEl('div', 'action-control-button', this.controlsContainer)
            control.innerHTML = label
            control.classList.add(`hidden`)
            this.controls.push(control)
        }
    }

    /* ----------------------- Render ----------------------- */

    render(action: Action) {
        // Set label
        // this.preLabel.innerHTML = action.execution.nodeData.preLabel ?? ''

        // if (action.timeline.state.isRoot) {
        //     // TODO Fix
        //     this.preLabel.innerHTML = getLabelOfExecution(action.execution)
        // }

        setSourceCodeOfExecution(action)

        this.updateClasses(action)

        this.renderStepsAndViews(action)

        // Add expand button if node is expandable
        if (isExpandable(action.execution)) {
            this.header.appendChild(this.expandButton)
        }
    }

    updateClasses(action: Action) {
        // Set classes
        action.execution.nodeData.type == 'Program'
            ? this.element.classList.add('program')
            : this.element.classList.remove('program')

        action.steps.length > 0
            ? this.element.classList.add('showing-steps')
            : this.element.classList.remove('showing-steps')

        action.state.inline
            ? this.element.classList.add('inline')
            : this.element.classList.remove('inline')

        action.state.isFocusedStep
            ? this.element.classList.add('focused-step')
            : this.element.classList.remove('focused-step')
    }

    renderStepsAndViews(action: Action) {
        // Set position of steps and views
        this.body.innerHTML = ''
        this.body.appendChild(this.baseElement)
        this.body.appendChild(action.cursor.element)
        if (action.steps.length > 0) {
            let viewHits = new Set()
            for (let i = 0; i < action.steps.length; i++) {
                // View
                for (let j = 0; j < action.views.length; j++) {
                    if (viewHits.has(j)) continue

                    const time = action.viewTimes[j]
                    if (time == i) {
                        const view = action.views[j]
                        this.body.appendChild(view.renderer.element)
                        viewHits.add(j)
                    }
                }

                const step = action.steps[i]

                if (step instanceof ActionBundle || step.state.inline) {
                    this.body.appendChild(step.renderer.element)

                    if (step instanceof Action && step.state.isFocusedStep) {
                        // Move to where the focus is
                        const area = action.interactionAreas.find(
                            (area) => area.execution == step.execution
                        )
                        if (area) {
                            const left = getNumericalValueOfStyle(area.element.style.left, 0)
                            step.state.position.x = left
                        }
                    }
                } else {
                    // Set position
                    const thisBbox = this.element.getBoundingClientRect()
                    const stepBbox = step.renderer.element.getBoundingClientRect()
                    const vizBbox = Executor.instance.visualization.element.getBoundingClientRect()
                    const camera = Executor.instance.visualization.camera

                    step.state.position.x =
                        thisBbox.x + thisBbox.width - vizBbox.x - camera.state.position.x + 100
                    step.state.position.y = Executor.instance.visualization.root.state.position.y
                    step.renderer.render(step)
                    // camera.state.position.y
                }
            }

            // Any left-over view
            for (let j = 0; j < action.views.length; j++) {
                if (viewHits.has(j)) continue

                const time = action.viewTimes[j]
                if (time == action.steps.length) {
                    const view = action.views[j]
                    this.body.appendChild(view.renderer.element)
                    viewHits.add(j)
                }
            }
        }
    }

    /* ----------------------- Destroy ---------------------- */

    destroy() {
        this.element.remove()

        this.element = null

        this.header = null
        this.headerLabel = null
        this.headerPreLabel = null

        this.footer = null
        this.footerLabel = null
        this.footerPreLabel = null

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

function setSourceCodeOfExecution(action: Action) {
    const execution = action.execution

    // Header
    const range = execution.nodeData.location
    let headerLabel = Editor.instance.monaco.getModel().getValueInRange({
        startLineNumber: range.start.line,
        startColumn: range.start.column + 1,
        endLineNumber: range.end.line,
        endColumn: range.end.column + 1,
    })
    let headerLineNumbers = ''

    // Footer
    action.renderer.footerPreLabel.innerText = ''
    action.renderer.footerLabel.innerText = ''

    let footerLabel = null
    let footerLineNumbers = null

    headerLineNumbers = execution.nodeData.location.start.line.toString()

    if (execution.nodeData.type == 'FunctionCall' || execution.nodeData.type == 'ForStatement') {
        let upTill = headerLabel.substring(0, headerLabel.indexOf('{')).trim()

        // Label
        if (action.steps.length > 0) {
            headerLabel = `${upTill} {`
        } else {
            headerLabel = `${upTill} { ...`
        }
        footerLabel = '}'

        // Line numbers
        footerLineNumbers = `${execution.nodeData.location.end.line}`
    } else if (range.end.line - range.start.line > 0) {
        if (
            execution.nodeData.type == 'ForStatement' ||
            execution.nodeData.type == 'WhileStatement' ||
            execution.nodeData.type == 'IfStatement'
        ) {
            let upTill = headerLabel.substring(0, headerLabel.indexOf('{')).trim()
            headerLabel = `${upTill} { ...\n}`
            headerLineNumbers += `\n${execution.nodeData.location.end.line}`
        } else if (execution.nodeData.type == 'FunctionDeclaration') {
            let upTill = headerLabel.substring(0, headerLabel.indexOf('{')).trim()
            headerLabel = `${upTill} { ... }`
        } else {
            headerLabel = `{ ... }`
        }
    } else {
        headerLabel = Editor.instance.monaco.getModel().getValueInRange({
            startLineNumber: range.start.line,
            startColumn: range.start.column + 1,
            endLineNumber: range.end.line,
            endColumn: range.end.column + 1,
        })
    }

    if (action.state.spacingDelta > 0) {
        // label += '\n'
        if (footerLineNumbers == null) {
            footerLineNumbers = `${(execution.nodeData.location.end.line + 1).toString()}`
        } else {
            footerLineNumbers += `\n${(execution.nodeData.location.end.line + 1).toString()}`
        }
    }

    // Render line numbers
    if (action.steps.length == 0 || action.state.inline) {
        action.renderer.headerPreLabel.innerText = headerLineNumbers
    } else {
        action.renderer.headerPreLabel.innerText = ''
    }

    if (footerLineNumbers != null) {
        action.renderer.footerPreLabel.innerText = footerLineNumbers
    }

    // Render labels
    monaco.editor
        .colorize(headerLabel, 'javascript', {})
        .then((result) => (action.renderer.headerLabel.innerHTML = result))

    if (footerLabel != null) {
        monaco.editor
            .colorize(footerLabel, 'javascript', {})
            .then((result) => (action.renderer.footerLabel.innerHTML = result))
    }
}

export function isExpandable(execution: ExecutionGraph | ExecutionNode) {
    const expandibleTypes = new Set([
        'ForStatement',
        'WhileStatement',
        'IfStatement',
        'FunctionCall',
    ])

    return expandibleTypes.has(execution.nodeData.type)
}
