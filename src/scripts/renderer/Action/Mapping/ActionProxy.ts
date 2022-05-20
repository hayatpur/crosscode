import { createEl } from '../../../utilities/dom'
import { Ticker } from '../../../utilities/Ticker'
import { Action } from '../Action'

export class ActionProxy {
    // Container of this things indicator and it's steps
    element: HTMLElement
    indicator: HTMLElement
    text: HTMLElement

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
        this.element.classList.add(`${this.action.execution.nodeData.preLabel}`)

        this.indicator = createEl('div', 'action-proxy-indicator', this.element)

        // this.text = createEl('div', 'action-proxy-text', this.element)
    }

    /* ----------------------- Update ----------------------- */
    tick(dt: number) {
        // this.text.innerText = `${this.timeOffset}`

        if (!this.dirty) return

        this.update()

        this.dirty = false
    }

    update() {
        const hits: Set<string> = new Set()

        if (this.action.steps.length > 0) {
            this.element.classList.add('has-steps')
        } else {
            this.element.classList.remove('has-steps')
        }

        for (const step of this.action.steps) {
            let proxy = this.steps[step.execution.id]

            if (proxy == null) {
                proxy = new ActionProxy(step)
                this.steps[step.execution.id] = proxy
                this.indicator.appendChild(proxy.element)
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
        let labelBbox = this.action.renderer.headerLabel.getBoundingClientRect()
        let bbox = this.action.renderer.element.getBoundingClientRect()
        const multiplier = this.action.steps.length == 0 ? 1 : 1
        this.indicator.style.width = `${labelBbox.width * 0.2 * multiplier}px`
        this.indicator.style.height = `${bbox.height * 0.4 * multiplier}px`
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
        const indicatorBBox = this.indicator.getBoundingClientRect()

        return [[indicatorBBox.x + 10, indicatorBBox.y + indicatorBBox.height / 2]]
    }
}
