import { Executor } from '../../executor/Executor'
import { createEl } from '../../utilities/dom'
import { Ticker } from '../../utilities/Ticker'
import { Action } from '../Action/Action'

export class Minimap {
    element: HTMLElement
    actions: Action[] = []

    proxyElements: HTMLElement[] = []

    private _tickerId: string

    /* ----------------------- Create ----------------------- */
    constructor() {
        this.create()

        this._tickerId = Ticker.instance.registerTick(this.tick.bind(this))
    }

    create() {
        this.element = createEl('div', 'minimap', document.body)
    }

    /* ------------------------ State ----------------------- */
    addAction(action: Action) {
        this.actions.push(action)
        const proxy = createEl('div', 'minimap-proxy', this.element)

        this.proxyElements.push(proxy)
    }

    /* ----------------------- Update ----------------------- */
    tick() {
        for (let i = 0; i < this.actions.length; i++) {
            if (this.actions[i].renderer == null) return

            this.proxyElements[i].innerText = this.actions[i].renderer.headerLabel.innerText

            const position = this.actions[i].state.position
            this.proxyElements[i].style.left = `${
                position.x * Executor.instance.PARAMS.ms * 0.1 + Executor.instance.PARAMS.mx * 100
            }px`
            this.proxyElements[i].style.top = `${
                position.y * Executor.instance.PARAMS.ms * 0.2 + Executor.instance.PARAMS.my * 100
            }px`
        }
    }

    /* ----------------------- Destroy ---------------------- */

    destroy() {
        Ticker.instance.removeTickFrom(this._tickerId)
        this.element.remove()
        this.proxyElements.forEach((proxy) => {
            proxy.remove()
        })
    }
}
