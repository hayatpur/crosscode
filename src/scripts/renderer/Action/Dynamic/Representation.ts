import * as monaco from 'monaco-editor'
import { Editor } from '../../../editor/Editor'
import { EnvironmentState } from '../../../environment/EnvironmentState'
import { Action } from '../Action'

/* ------------------------------------------------------ */
/*              Abstract representation class             */
/* ------------------------------------------------------ */
export class Representation {
    action: Action

    constructor(action: Action) {
        this.action = action
    }

    update() {
        this.setSourceCodeOfExecution()
    }

    setSourceCodeOfExecution() {
        // Header
        const range = this.action.execution.nodeData.location
        let headerLabel = Editor.instance.monaco.getModel().getValueInRange({
            startLineNumber: range.start.line,
            startColumn: range.start.column + 1,
            endLineNumber: range.end.line,
            endColumn: range.end.column + 1,
        })

        this.action.renderer.footerLineLabel.innerText = ''
        this.action.renderer.footerLabel.innerText = ''

        let footerLabel = null
        let footerLineNumbers = null
        let headerLineNumbers = this.action.execution.nodeData.location.start.line.toString()

        if (this.action.state.isExpression && this.action.state.isInline) {
            // Inline expression
            headerLineNumbers = ''
        }

        // Set the line numbers
        this.action.renderer.headerLineLabel.innerText = headerLineNumbers
        if (footerLineNumbers != null) {
            this.action.renderer.footerLineLabel.innerText = footerLineNumbers
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

    // Get frames should call get frames of each step.
    getFrames(): [env: EnvironmentState, actionId: string][] {
        if (this.action.steps.length == 0) {
            return [[this.action.execution.postcondition, this.action.state.id]]
        } else {
            const frames = []
            for (const step of this.action.steps) {
                frames.push(...step.representation.getFrames())
            }
            return frames
        }
    }

    destroy() {}
}
