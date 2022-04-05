import * as monaco from 'monaco-editor'
import { Editor } from '../../../editor/Editor'
import { instanceOfExecutionNode } from '../../../execution/primitive/ExecutionNode'
import { Action } from '../Action'

/* ------------------------------------------------------ */
/*              Abstract representation class             */
/* ------------------------------------------------------ */
export class Representation {
    action: Action
    currentRepresentation: number = 0
    totalRepresentations: number = 0

    constructor(action: Action, totalRepresentations: number = null) {
        this.action = action
        if (totalRepresentations != null) {
            this.totalRepresentations = totalRepresentations
        }
        this.create()
        this.render()
    }

    create() {
        this.setSourceCodeOfExecution()

        if (instanceOfExecutionNode(this.action.execution)) {
            return
        }
    }

    cycle() {
        this.currentRepresentation = (this.currentRepresentation + 1) % this.totalRepresentations

        this.applyRepresentation()
        this.render()
    }

    applyRepresentation() {
        if (this.totalRepresentations === 0) {
            return
        }

        if (this.currentRepresentation == 0) {
            this.action.controller.destroyStepsAndViews()
        } else {
            this.action.controller.createSteps()
        }
    }

    render() {
        this.setSourceCodeOfExecution()
        if (this.totalRepresentations === 0) {
            return
        }
    }

    destroy() {}

    setSourceCodeOfExecution() {
        // Header
        const range = this.action.execution.nodeData.location
        let headerLabel = Editor.instance.monaco.getModel().getValueInRange({
            startLineNumber: range.start.line,
            startColumn: range.start.column + 1,
            endLineNumber: range.end.line,
            endColumn: range.end.column + 1,
        })

        this.action.renderer.footerPreLabel.innerText = ''
        this.action.renderer.footerLabel.innerText = ''

        let footerLabel = null
        let footerLineNumbers = null
        let headerLineNumbers = this.action.execution.nodeData.location.start.line.toString()

        // Spacing
        if (this.action.state.spacingDelta > 0) {
            footerLineNumbers = `${(
                this.action.execution.nodeData.location.end.line + 1
            ).toString()}`
        }

        // Set the line numbers
        this.action.renderer.headerPreLabel.innerText = headerLineNumbers
        if (footerLineNumbers != null) {
            this.action.renderer.footerPreLabel.innerText = footerLineNumbers
        }

        // Render labels
        monaco.editor.colorize(headerLabel, 'javascript', {}).then((result) => {
            if (this.action?.renderer?.headerLabel != null) {
                this.action.renderer.headerLabel.innerHTML = result
            }
        })

        if (footerLabel != null) {
            monaco.editor.colorize(footerLabel, 'javascript', {}).then((result) => {
                if (this.action?.renderer?.footerLabel != null) {
                    this.action.renderer.footerLabel.innerHTML = result
                }
            })
        }
    }

    // setSourceCodeOfExecution() {
    //     const action = this.action
    //     const execution = action.execution

    //     // Header
    //     const range = execution.nodeData.location
    //     let headerLabel = Editor.instance.monaco.getModel().getValueInRange({
    //         startLineNumber: range.start.line,
    //         startColumn: range.start.column + 1,
    //         endLineNumber: range.end.line,
    //         endColumn: range.end.column + 1,
    //     })
    //     let headerLineNumbers = ''

    //     // Footer
    //     action.renderer.footerPreLabel.innerText = ''
    //     action.renderer.footerLabel.innerText = ''

    //     let footerLabel = null
    //     let footerLineNumbers = null

    //     headerLineNumbers = execution.nodeData.location.start.line.toString()

    //     if (execution.nodeData.type == 'FunctionCall') {
    //         let upTill = headerLabel.substring(0, headerLabel.indexOf('{')).trim()

    //         // Label
    //         if (action.steps.length > 0) {
    //             headerLabel = `${upTill} {`
    //         } else {
    //             headerLabel = `${upTill} { ...`
    //         }
    //         footerLabel = '}'

    //         // Line numbers
    //         footerLineNumbers = `${execution.nodeData.location.end.line}`
    //     } else if (execution.nodeData.type == 'ForStatement') {
    //         let upTill = headerLabel.substring(0, headerLabel.indexOf('{')).trim()

    //         // Label
    //         if (action.steps.length == 0) {
    //             headerLabel = `for ( ... ) { ... }`
    //         } else {
    //             headerLabel = `${upTill} {`
    //             footerLabel = '}'
    //         }
    //         // footerLabel = '}'
    //         // Line numbers
    //         footerLineNumbers = `${execution.nodeData.location.end.line}`
    //     } else if (range.end.line - range.start.line > 0) {
    //         if (
    //             execution.nodeData.type == 'ForStatement' ||
    //             execution.nodeData.type == 'WhileStatement' ||
    //             execution.nodeData.type == 'IfStatement'
    //         ) {
    //             let upTill = headerLabel.substring(0, headerLabel.indexOf('{')).trim()
    //             headerLabel = `${upTill} { ...\n}`
    //             headerLineNumbers += `\n${execution.nodeData.location.end.line}`
    //         } else if (execution.nodeData.type == 'FunctionDeclaration') {
    //             let upTill = headerLabel.substring(0, headerLabel.indexOf('{')).trim()
    //             headerLabel = `${upTill} { ... }`
    //         } else {
    //             headerLabel = `{ ... }`
    //         }
    //     } else {
    //         headerLabel = Editor.instance.monaco.getModel().getValueInRange({
    //             startLineNumber: range.start.line,
    //             startColumn: range.start.column + 1,
    //             endLineNumber: range.end.line,
    //             endColumn: range.end.column + 1,
    //         })
    //     }

    //     if (action.state.spacingDelta > 0) {
    //         // label += '\n'
    //         if (footerLineNumbers == null) {
    //             footerLineNumbers = `${(execution.nodeData.location.end.line + 1).toString()}`
    //         } else {
    //             footerLineNumbers += `\n${(execution.nodeData.location.end.line + 1).toString()}`
    //         }
    //     }

    //     action.renderer.headerPreLabel.innerText = headerLineNumbers

    //     if (footerLineNumbers != null) {
    //         action.renderer.footerPreLabel.innerText = footerLineNumbers
    //     }

    //     // Render labels
    //     monaco.editor.colorize(headerLabel, 'javascript', {}).then((result) => {
    //         if (action?.renderer?.headerLabel != null) {
    //             action.renderer.headerLabel.innerHTML = result
    //         }
    //     })

    //     if (footerLabel != null) {
    //         monaco.editor.colorize(footerLabel, 'javascript', {}).then((result) => {
    //             if (action?.renderer?.footerLabel != null) {
    //                 action.renderer.footerLabel.innerHTML = result
    //             }
    //         })
    //     }
    // }
}
