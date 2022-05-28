import { createEl } from '../../../utilities/dom'
import { Ticker } from '../../../utilities/Ticker'
import { Action } from '../Action'

export class ActionProxy {
    // Container of this things indicator and it's steps
    element: HTMLElement
    // indicator: HTMLElement
    // text: HTMLElement

    // Corresponding action
    action: Action

    // Sub-steps
    steps: { [stepId: string]: ActionProxy } = {}

    // Time in control flow
    timeOffset: number = 0

    private _tickerId: string

    dirty: boolean = true

    constructor(action: Action) {
        this.action = action
        this.action.proxy = this

        this.create()

        this._tickerId = Ticker.instance.registerTick(this.tick.bind(this))
    }

    create() {
        this.element = createEl('div', 'action-proxy-container')
        this.element.classList.add(`_${this.action.execution.nodeData.type}`)
        this.element.classList.add(`${this.action.execution.nodeData.preLabel}`)

        // this.indicator = createEl('div', 'action-proxy-indicator', this.element)
    }

    /* ----------------------- Update ----------------------- */
    tick(dt: number) {
        // Update own position
        let bbox: DOMRect = null

        if (this.action.state.isShowingSteps) {
            bbox = this.action.renderer.stepContainer.getBoundingClientRect()
        } else {
            bbox = this.action.interactionArea.element.getBoundingClientRect()
        }
        const parentBbox = this.action.renderer.element.parentElement.getBoundingClientRect()

        const heightMultiplier = 0.6
        const widthMultiplier = 0.4

        const y = bbox.top - parentBbox.y
        const x = bbox.left - parentBbox.x

        this.element.style.top = `${
            y * (this.action.parent.state.isInline ? heightMultiplier : 1) +
            (bbox.height * (1 - heightMultiplier)) / 2
        }px`
        this.element.style.left = `${x * widthMultiplier}px`
        this.element.style.height = `${bbox.height * heightMultiplier}px`
        this.element.style.width = `${bbox.width * widthMultiplier}px`

        if (!this.dirty) return

        this.update()

        this.dirty = false

        /* ------------- Specialized representations ------------ */
        if (this.action.execution.nodeData.preLabel == 'Test') {
            if (!this.action.state.isShowingSteps) {
                this.element.innerHTML = `<ion-icon name="checkmark-outline"></ion-icon>`
            } else {
                // TODO
            }
        }
    }

    update() {
        const hits: Set<string> = new Set()

        // Update classes
        if (this.action.steps.length > 0) {
            this.element.classList.add('has-steps')
        } else {
            this.element.classList.remove('has-steps')
        }

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

        // Update indicator
        // let labelBbox = this.action.renderer.headerLabel.getBoundingClientRect()
        // let bbox = this.action.renderer.element.getBoundingClientRect()
        // const multiplier = this.action.steps.length == 0 ? 1 : 1
        // this.indicator.style.width = `${labelBbox.width * 0.4 * multiplier}px`
        // this.indicator.style.height = `${bbox.height * 0.5 * multiplier}px`
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
        return [[bbox.x + 10, bbox.y + bbox.height / 2]]
    }
}
