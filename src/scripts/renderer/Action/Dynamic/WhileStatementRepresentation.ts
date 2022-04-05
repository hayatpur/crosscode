import * as monaco from 'monaco-editor'
import { Editor } from '../../../editor/Editor'
import { ExecutionGraph } from '../../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../../execution/primitive/ExecutionNode'
import { Action } from '../Action'
import { getExecutionSteps } from '../ActionController'
import { Representation } from './Representation'

export class WhileStatementRepresentation extends Representation {
    constructor(action: Action) {
        super(action, 2)
    }

    applyRepresentation() {
        if (this.totalRepresentations === 0) {
            return
        }

        this.action.controller.destroyStepsAndViews()

        let relevantViewsPerIteration: (ExecutionGraph | ExecutionNode)[][] = []

        if (this.currentRepresentation == 1) {
            this.action.steps = []

            let steps = getExecutionSteps(this.action.execution)
            let iterations = (steps.length - 2) / 3

            for (let iter = 0; iter < iterations; iter++) {
                relevantViewsPerIteration[iter] = []

                // Comparison
                const comparison = steps[iter * 3 + 1]
                const comparisonAction = new Action(comparison, this.action, {
                    spacingDelta: 0,
                    inline: true,
                    inSitu: true,
                })
                this.action.steps.push(comparisonAction)
                relevantViewsPerIteration[iter].push(comparison)

                // Loop body
                const body = steps[iter * 3 + 2]
                const bodyAction = new Action(body, this.action, {
                    spacingDelta: 0,
                    inline: true,
                    stripped: true,
                })
                this.action.steps.push(bodyAction)
                relevantViewsPerIteration[iter].push(body)
            }

            // Render them so they're in the right place
            this.action.renderer.render(this.action)
        }

        const spatialRoot = this.action.controller.getSpatialRoot()
        spatialRoot.mapping.updateSteps()
        this.action.controller.updateTemporalOverlaps()
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

        this.action.renderer.footerPreLabel.innerText = ''
        this.action.renderer.footerLabel.innerText = ''

        let footerLabel = null
        let footerLineNumbers = `${this.action.execution.nodeData.location.end.line}`
        let headerLineNumbers = this.action.execution.nodeData.location.start.line.toString()

        // Label
        if (this.currentRepresentation == 0) {
            headerLabel = `while ( ... ) { ... }`
        } else {
            let upTill = headerLabel.substring(0, headerLabel.indexOf('{')).trim()
            headerLabel = `${upTill} {`
            footerLabel = '}'
        }

        // Spacing
        if (this.action.state.spacingDelta > 0) {
            if (footerLineNumbers == null) {
                footerLineNumbers = `${(
                    this.action.execution.nodeData.location.end.line + 1
                ).toString()}`
            } else {
                footerLineNumbers += `\n${(
                    this.action.execution.nodeData.location.end.line + 1
                ).toString()}`
            }
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
}
