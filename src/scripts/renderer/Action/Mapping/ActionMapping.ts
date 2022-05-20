import { createEl } from '../../../utilities/dom'
import { Ticker } from '../../../utilities/Ticker'
import { Action } from '../Action'
import { ActionMappingCursor } from './ActionMappingCursor'
import { ActionProxy } from './ActionProxy'
import { ControlFlow } from './ControlFlow'

export class ActionMapping {
    element: HTMLElement

    // Root action
    action: Action

    // Action proxies
    proxySteps: { [stepId: string]: ActionProxy } = {}

    // State
    isHidden: boolean = false

    // Break indices (occurs between actions[index] and actions[index + 1])
    breaks: number[] = []
    breakElements: HTMLElement[] = []

    // Control flow
    controlFlow: ControlFlow
    time: number = 0

    cursor: ActionMappingCursor

    // Other
    private _tickerId: string

    // Flag for if it needs to re-render
    dirty: boolean = true

    constructor(action: Action) {
        this.action = action
        this.create()
        // this.addBreak(0)

        this.hide()

        this.element.addEventListener('click', (e) => {
            if (
                e.target !== this.element &&
                e.target !== this.element.parentElement &&
                !(e.target as HTMLElement).classList.contains('action-proxy-container')
            )
                return

            if (this.isHidden) {
                this.show()
            } else {
                // TODO
                // this.hide()
            }
        })

        this._tickerId = Ticker.instance.registerTick(this.tick.bind(this))

        this.controlFlow = new ControlFlow(this)

        // Create cursor
        this.cursor = new ActionMappingCursor(this)
    }

    addBreak(index: number) {
        this.breaks.push(index)

        const breakEl = createEl('div', 'action-mapping-break', this.element)
        this.breakElements.push(breakEl)
    }

    updateSteps() {}

    create() {
        this.element = createEl('div', 'action-mapping', this.action.renderer.element)
    }

    tick(dt: number) {
        /* --------------- Update proxy positions --------------- */
        const thisBbox = this.element.getBoundingClientRect()

        for (const [stepId, proxy] of Object.entries(this.proxySteps)) {
            const step = this.action.steps.find((step) => step.execution.id === stepId)

            const bbox = step.renderer.element.getBoundingClientRect()
            const bboxHeader = step.renderer.header.getBoundingClientRect()

            proxy.element.style.top = `${bbox.top - thisBbox.y}px`
            proxy.element.style.height = `${bbox.height}px`
        }

        /* -------------------- Update breaks ------------------- */
        for (let i = 0; i < this.breaks.length; i++) {
            const breakElement = this.breakElements[i]
            const breakIndex = this.breaks[i]

            const step = this.action.steps[breakIndex]
            const nextStep = this.action.steps[breakIndex + 1]

            if (nextStep == null) {
                continue
            }

            const proxy = this.proxySteps[step.execution.id]
            const nextProxy = this.proxySteps[nextStep.execution.id]

            if (proxy == null || nextProxy == null) {
                continue
            }

            const bbox = proxy.element.getBoundingClientRect()
            const nextBbox = nextProxy.element.getBoundingClientRect()

            breakElement.style.top = `${(bbox.bottom + nextBbox.top) / 2 - thisBbox.y}px`
        }

        if (!this.dirty) return

        this.update()
    }

    update() {
        /* ------------------- Update proxies ------------------- */
        // TODO: This doesn't need to be reactive. Call a method like createSteps() instead.
        const hits: Set<string> = new Set()

        for (const step of this.action.steps) {
            let proxy = this.proxySteps[step.execution.id]

            if (proxy == null) {
                proxy = new ActionProxy(step)
                this.proxySteps[step.execution.id] = proxy
                this.element.appendChild(proxy.element)
            }

            proxy.update()

            hits.add(step.execution.id)
        }

        // Remove unused proxies
        for (const stepId of Object.keys(this.proxySteps)) {
            if (!hits.has(stepId)) {
                this.proxySteps[stepId].element.remove()
                delete this.proxySteps[stepId]
            }
        }

        this.controlFlow.update()

        this.dirty = false
    }

    hide() {
        this.isHidden = true
        this.element.classList.add('is-hidden')
    }

    show() {
        this.isHidden = false
        this.element.classList.remove('is-hidden')
    }

    duration() {
        return this.controlFlow.flowPath.getTotalLength()
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        this.element.remove()

        Ticker.instance.removeTickFrom(this._tickerId)

        this.element = null
        this.action = null
    }
}
