import { createEl } from '../../../utilities/dom'
import { Action } from '../Action'

export class ActionProxy {
    static all: { [id: string]: ActionProxy } = {}

    // Container of this things indicator and it's steps
    element: HTMLElement

    // Corresponding action
    action: Action

    // Sub-steps
    steps: { [stepId: string]: ActionProxy } = {}

    // Time in control flow
    timeOffset: number = 0

    static heightMultiplier = 0.6
    static widthMultiplier = 0.4

    constructor(action: Action) {
        this.action = action

        ActionProxy.all[action.state.id] = this

        this.create()
        this.update()

        this.element.addEventListener('click', (e) => {
            if (this.action.state.isShowingSteps) {
                this.action.destroySteps()
            } else {
                this.action.createSteps()
            }

            e.stopPropagation()
            e.preventDefault()
        })
    }

    create() {
        const classes = [
            'action-proxy-container',
            `_${this.action.execution.nodeData.type?.replace(' ', '-')}`,
            `${this.action.execution.nodeData.preLabel?.replace(' ', '-')}`,
        ]

        this.element = createEl('div', classes)
    }

    update() {
        const hits: Set<string> = new Set()

        // Update classes
        this.action.steps.length > 0
            ? this.element.classList.add('has-steps')
            : this.element.classList.remove('has-steps')

        // Update steps
        for (const step of this.action.steps) {
            let proxy = this.steps[step.execution.id]

            if (proxy == null) {
                proxy = new ActionProxy(step)
                this.steps[step.execution.id] = proxy
                this.element.appendChild(proxy.element)
            }

            proxy.update()

            hits.add(step.execution.id)
        }

        // Remove unused
        for (const [stepId, proxy] of Object.entries(this.steps)) {
            if (!hits.has(stepId)) {
                proxy.element.remove()
                delete this.steps[stepId]
            }
        }

        // Update own visual
        this.action.representation.updateProxyVisual(this)

        /* ------------- Specialized representations ------------ */
        if (this.action.execution.nodeData.preLabel == 'Test') {
            if (!this.action.state.isShowingSteps) {
                this.element.innerHTML = `<ion-icon name="checkmark-outline"></ion-icon>`
            } else {
                // TODO
            }
        }
    }

    /* ------------------------ Focus ----------------------- */
    clearFocus() {
        this.element.classList.remove('is-focused')
    }

    unfocus() {
        this.element.classList.remove('is-focused')
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
        return [[bbox.x + bbox.width / 2, bbox.y + bbox.height / 2]]
    }

    destroy() {
        delete ActionProxy.all[this.action.state.id]

        this.element.remove()
        this.element = null
    }
}
