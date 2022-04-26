import { createEl } from '../../../utilities/dom'
import { Ticker } from '../../../utilities/Ticker'
import { Action } from '../Action'
import { ActionProxy } from './ActionProxy'

export class ActionMapping {
    element: HTMLElement

    // Root action
    action: Action

    // Connections container
    connectionsContainer: SVGElement

    // Action proxies
    proxySteps: { [stepId: string]: ActionProxy } = {}

    // Other
    isHidden: boolean = false
    _tickerId: string

    constructor(action: Action) {
        this.action = action
        this.create()

        this.hide()
        this.element.addEventListener('click', () => {
            if (this.isHidden) {
                this.show()
            } else {
                this.hide()
            }
        })

        this._tickerId = Ticker.instance.registerTick(this.tick.bind(this))
    }

    updateSteps() {
        const hits: Set<string> = new Set()

        for (const step of this.action.steps) {
            let proxy = this.proxySteps[step.execution.id]

            if (proxy == null) {
                proxy = new ActionProxy(step, true)
                this.proxySteps[step.execution.id] = proxy
                this.element.appendChild(proxy.element)
            }

            proxy.updateSteps()

            hits.add(step.execution.id)
        }

        // Remove unused
        for (const stepId of Object.keys(this.proxySteps)) {
            if (!hits.has(stepId)) {
                this.proxySteps[stepId].element.remove()
                delete this.proxySteps[stepId]
            }
        }

        // Update view steps
        this.action.views.forEach((view) => {
            view.controller.setFrames()
        })
    }

    create() {
        this.element = createEl('div', 'action-mapping', this.action.renderer.mappingContainer)

        this.connectionsContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        this.element.appendChild(this.connectionsContainer)
        this.connectionsContainer.classList.add('action-mapping-connections-container')
    }

    render() {}

    tick(dt: number) {
        const thisBbox = this.element.getBoundingClientRect()

        for (const [stepId, proxy] of Object.entries(this.proxySteps)) {
            const step = this.action.steps.find((step) => step.execution.id === stepId)

            const bbox = step.renderer.element.getBoundingClientRect()
            const bboxHeader = step.renderer.header.getBoundingClientRect()

            proxy.element.style.top = `${bbox.top - thisBbox.y}px`
            proxy.element.style.height = `${bboxHeader.height}px`
        }
    }

    hide() {
        this.isHidden = true
        this.element.classList.add('hidden')
        this.element.parentElement.classList.add('hidden')
    }

    show() {
        this.isHidden = false
        this.element.classList.remove('hidden')
        this.element.parentElement.classList.remove('hidden')
        this.render()
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        this.element.remove()

        Ticker.instance.removeTickFrom(this._tickerId)

        this.element = null
        this.action = null
    }
}
