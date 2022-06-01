import { Editor } from '../../editor/Editor'
import { isExpandable } from '../../utilities/action'
import { createEl } from '../../utilities/dom'
import { Ticker } from '../../utilities/Ticker'
import { Action } from './Action'

/* ------------------------------------------------------ */
/*                     Action Renderer                    */
/* ------------------------------------------------------ */
export class ActionRenderer {
    action: Action

    // Parent element
    element: HTMLElement

    // Container of all sub-steps
    stepContainer: HTMLElement

    // Header
    header: HTMLElement
    headerLabel: HTMLElement
    headerLineLabel: HTMLElement

    // Footer
    footer: HTMLElement
    footerLabel: HTMLElement
    footerLineLabel: HTMLElement

    // Expandable
    expandButton: HTMLElement

    private _tickerId: string

    /* ----------------------- Create ----------------------- */
    constructor(action: Action) {
        this.action = action

        // Create dom elements
        this.create()

        this._tickerId = Ticker.instance.registerTick(this.tick.bind(this))
    }

    create() {
        this.element = createEl('div', 'action')

        // Body
        this.stepContainer = createEl('div', 'action-step-container', this.element)

        // Header
        this.header = createEl('div', 'action-header', this.stepContainer)
        this.headerLabel = createEl('div', 'action-label', this.header)
        this.headerLineLabel = createEl('div', 'action-line-label', this.header)

        // Footer
        this.footer = createEl('div', 'action-footer', this.stepContainer)
        this.footerLabel = createEl('div', 'action-label', this.footer)
        this.footerLineLabel = createEl('div', 'action-line-label', this.footer)

        if (isExpandable(this.action.execution)) {
            this.expandButton = createEl('div', 'action-expand-button', this.element)
        }
    }

    /* ----------------------- Render ----------------------- */
    tick(dt: number) {
        this.action.interactionArea?.tick(dt)

        if (!this.action.dirty) return

        this.updateClasses()
        this.renderSteps()
        this.action.representation.update()
        this.action.mapping?.update()

        if (!this.action.state.isInline) {
            this.action.controller.updateFrames()
        }

        this.action.dirty = false
    }

    updateClasses() {
        // Set classes
        this.action.execution.nodeData.type == 'Program'
            ? this.element.classList.add('is-program')
            : this.element.classList.remove('is-program')

        this.action.steps.length > 0
            ? this.element.classList.add('is-showing-steps')
            : this.element.classList.remove('is-showing-steps')

        this.action.state.isInline
            ? this.element.classList.add('is-inline')
            : this.element.classList.remove('is-inline')

        this.action.state.isExpression
            ? this.element.classList.add('is-expression')
            : this.element.classList.remove('is-expression')

        this.action.state.isIndented
            ? this.element.classList.add('is-indented')
            : this.element.classList.remove('is-indented')
    }

    renderSteps() {
        this.stepContainer.innerHTML = ''

        // Set position of steps and views
        this.stepContainer.appendChild(this.header)

        if (this.action.steps.length > 0) {
            let line = this.action.steps[0]?.execution.nodeData.location.end.line

            for (let i = 0; i < this.action.steps.length; i++) {
                const step = this.action.steps[i]

                if (step.execution.nodeData.location.start.line > line + 1) {
                    const newLine = createEl('div', 'action-step-newline', this.stepContainer)
                    newLine.innerText = `${line + 1}`
                }

                if (step.state.isExpression) {
                    this.stepContainer.appendChild(step.renderer.element)

                    const stepBbox = Editor.instance.computeBoundingBoxForLoc(
                        step.execution.nodeData.location
                    )
                    const parentBbox = Editor.instance.computeBoundingBoxForLoc(
                        this.action.execution.nodeData.location
                    )

                    step.renderer.element.style.left = `${stepBbox.x - parentBbox.x + 2}px`
                    step.renderer.element.style.top = `${stepBbox.y - parentBbox.y}px`
                } else if (step.state.isInline) {
                    this.stepContainer.appendChild(step.renderer.element)
                }

                line = step.execution.nodeData.location.end.line
            }
        }

        this.stepContainer.appendChild(this.footer)
    }

    /* ----------------------- Destroy ---------------------- */

    destroy() {
        this.element.remove()

        Ticker.instance.removeTickFrom(this._tickerId)

        this.element = null

        this.header = null
        this.headerLabel = null
        this.headerLineLabel = null

        this.footer = null
        this.footerLabel = null
        this.footerLineLabel = null

        this.stepContainer = null
    }
}
