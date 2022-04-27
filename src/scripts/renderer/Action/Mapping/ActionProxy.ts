import { Executor } from '../../../executor/Executor'
import { createEl } from '../../../utilities/dom'
import { Action } from '../Action'

export class ActionProxy {
    element: HTMLElement
    stepsContainer: HTMLElement
    indicator: HTMLElement
    label: HTMLElement

    action: Action
    isRoot: boolean = false

    steps: { [stepId: string]: ActionProxy } = {}

    // Specialized
    forStatementIterations: HTMLElement[] = []

    constructor(action: Action, root: boolean = false) {
        this.action = action
        this.isRoot = root

        this.action.proxy = this

        this.create()
    }

    create() {
        this.element = createEl('div', 'action-proxy-container')
        this.indicator = createEl('div', 'action-proxy-indicator', this.element)
        this.stepsContainer = createEl('div', 'action-proxy-steps', this.element)

        if (this.isRoot) {
            this.element.classList.add('root')
        }

        setTimeout(() => {
            this.updateLabel()
        })

        // Focus
        this.indicator.addEventListener('mouseenter', (e) => {
            Executor.instance.visualization.focus.focusOn(this.action.execution)
        })

        this.indicator.addEventListener('mouseleave', (e) => {
            Executor.instance.visualization.focus.clearFocus(this.action.execution)
        })

        this.element.classList.add(`${this.action.execution.nodeData.preLabel}`)

        this.label = createEl('div', 'action-proxy-label', this.element)
    }

    updateLabel() {
        let labelBbox = this.action.renderer.headerLabel.getBoundingClientRect()
        let bbox = this.action.renderer.element.getBoundingClientRect()

        if (labelBbox.width == 0 && labelBbox.height == 0) {
            const overlaps = [...Executor.instance.visualization.focus.actions].filter(
                (action) =>
                    JSON.stringify(action.execution.nodeData.location) ==
                    JSON.stringify(this.action.execution.nodeData.location)
            )

            for (const step of overlaps) {
                labelBbox = step.renderer.headerLabel.getBoundingClientRect()
                bbox = step.renderer.element.getBoundingClientRect()

                if (labelBbox.width != 0 || labelBbox.height != 0) {
                    break
                }
            }
        }

        bbox.height -= this.action.state.spacingDelta * 34

        // const loc = this.action.execution.nodeData.location
        // const width = (loc.end.column - loc.start.column) * 2
        // const height = (loc.end.line - loc.start.line + 1) * 4
        this.indicator.style.width = `${labelBbox.width * 0.15}px`
        this.indicator.style.height = `${bbox.height * 0.3}px`
    }

    updateSteps() {
        setTimeout(() => {
            this.updateLabel()
        })

        if (this.action.execution.nodeData.type == 'ForStatement') {
            // Reset
            this.forStatementIterations?.forEach((el) => el.remove())
            this.forStatementIterations = []
            for (const [stepId, proxy] of Object.entries(this.steps)) {
                proxy.element.remove()
                delete this.steps[stepId]
            }
            this.steps = {}

            if (this.action.state.isSelected) {
                this.element.classList.add('selected')
            }

            const hits: Set<string> = new Set()
            let iterations = (this.action.steps.length - 1) / 3

            for (let i = 0; i < iterations; i++) {
                const iteration = createEl('div', 'action-proxy-iteration', this.stepsContainer)
                this.forStatementIterations.push(iteration)
                // const header = createEl('div', 'action-proxy-iteration-header', iteration)

                if (i == 0) {
                    const init = this.action.steps[0]
                    const initProxy = new ActionProxy(init)
                    this.steps[init.execution.id] = initProxy
                    iteration.appendChild(initProxy.element)

                    initProxy.updateSteps()
                }

                const comparison = this.action.steps[i * 3 + 1]
                const comparisonProxy = new ActionProxy(comparison)
                this.steps[comparison.execution.id] = comparisonProxy
                iteration.appendChild(comparisonProxy.element)

                comparisonProxy.updateSteps()

                const body = this.action.steps[i * 3 + 2]
                const bodyProxy = new ActionProxy(body)
                this.steps[body.execution.id] = bodyProxy
                iteration.appendChild(bodyProxy.element)

                bodyProxy.updateSteps()

                const update = this.action.steps[i * 3 + 3]
                const updateProxy = new ActionProxy(update)
                this.steps[update.execution.id] = updateProxy
                iteration.appendChild(updateProxy.element)

                updateProxy.updateSteps()
            }
        } else {
            if (this.action.state.isSelected) {
                this.element.classList.add('selected')
            }

            const hits: Set<string> = new Set()

            for (const step of this.action.steps) {
                let proxy = this.steps[step.execution.id]

                if (proxy == null) {
                    proxy = new ActionProxy(step)
                    this.steps[step.execution.id] = proxy
                    this.stepsContainer.appendChild(proxy.element)
                }

                proxy.updateSteps()
                hits.add(step.execution.id)
            }

            // Remove unused
            for (const [stepId, proxy] of Object.entries(this.steps)) {
                if (!hits.has(stepId)) {
                    proxy.element.remove()
                    delete this.steps[stepId]
                }
            }
        }
    }

    clearFocus() {
        this.element.classList.remove('is-focused')
    }

    unfocus() {
        this.element.classList.add('is-focused')
        this.element.classList.remove('is-focused-secondary')
    }

    focus(secondary = false) {
        this.element.classList.add('is-focused')

        if (secondary) {
            this.element.classList.add('is-focused-secondary')
        }
    }

    getControlFlowPoints() {
        const bbox = this.element.getBoundingClientRect()
        const indicatorBBox = this.indicator.getBoundingClientRect()

        return [[20, indicatorBBox.y + indicatorBBox.height / 2]]
    }
}
