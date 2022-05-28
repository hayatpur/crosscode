import * as monaco from 'monaco-editor'
import { Editor } from '../../../editor/Editor'
import { EnvironmentState } from '../../../environment/EnvironmentState'
import { Action } from '../Action'
import { Representation } from './Representation'

export class IfStatementRepresentation extends Representation {
    isExpanded: boolean = false

    constructor(action: Action) {
        super(action)

        action.controller.createSteps()

        action.renderer.expandButton.innerHTML = `<ion-icon name="chevron-forward-outline"></ion-icon>`

        action.renderer.expandButton.addEventListener('click', () => {
            // Create steps
            if (!this.isExpanded) {
                const body = this.action.steps[1]
                body.controller.createSteps()
                action.renderer.expandButton.innerHTML = `<ion-icon name="chevron-down-outline"></ion-icon>`
                this.isExpanded = true
            } else {
                const body = this.action.steps[1]
                body.controller.destroySteps()
                action.renderer.expandButton.innerHTML = `<ion-icon name="chevron-forward-outline"></ion-icon>`
                this.isExpanded = false
            }
        })
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

        // If statement
        let upTill = headerLabel.substring(0, headerLabel.indexOf('{')).trim()
        headerLabel = `${upTill} {`
        footerLabel = '}'
        footerLineNumbers = `${(this.action.execution.nodeData.location.end.line + 1).toString()}`

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

    getFrames(): [env: EnvironmentState, actionId: string][] {
        const steps = this.action.steps.filter((item, i) => i != 0)
        console.log('Getting if statement frames...', steps.length)

        return steps.map((step) => [step.execution.postcondition, step.state.id])
    }

    destroy() {}
}
