import * as monaco from 'monaco-editor'
import { Editor } from '../../../editor/Editor'
import { Action } from '../Action'
import { Representation } from './Representation'

export class BlockStatementRepresentation extends Representation {
    constructor(action: Action) {
        super(action)
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

        // Abbreviate body statement
        if (this.action.steps.length == 0) {
            headerLabel = `\t...`
        } else {
            headerLabel = ''
            headerLineNumbers = ''
        }
        // footerLabel = '}'
        // footerLineNumbers = `${(this.action.execution.nodeData.location.end.line + 1).toString()}`

        // Set the line numbers
        this.action.renderer.headerLineLabel.innerText = headerLineNumbers
        if (footerLineNumbers != null) {
            this.action.renderer.footerLineLabel.innerText = footerLineNumbers
        }

        if (headerLabel == '') {
            this.action.renderer.header.classList.add('is-hidden')
        } else {
            this.action.renderer.header.classList.remove('is-hidden')
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

    destroy() {}
}
