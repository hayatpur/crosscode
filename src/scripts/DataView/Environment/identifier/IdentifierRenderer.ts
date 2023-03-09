import { IdentifierState } from '../../../../transpiler/EnvironmentState'
import { clone } from '../../../../utilities/objects'
import { Ticker } from '../../../../utilities/Ticker'

export class IdentifierRenderer {
    element: HTMLElement
    environmentReference: HTMLElement

    private _tickerID: string
    _cachedState: IdentifierState | null = null

    constructor() {
        this.element = document.createElement('div')
        this.element.classList.add('identifier')

        this._tickerID = Ticker.instance.registerTick(this.tick.bind(this))
    }

    setState(state: IdentifierState) {
        this.element.innerHTML = `${state.name}`

        this._cachedState = clone(state)
    }

    tick(dt: number) {}

    destroy() {
        Ticker.instance.removeTickFrom(this._tickerID)
        this.element.remove()
    }

    /* ------------------------ Focus ----------------------- */

    secondaryFocus() {
        this.element.classList.add('secondary-focused')
    }

    focus() {
        this.element.classList.remove('secondary-focused')
    }

    clearFocus() {
        this.element.classList.remove('secondary-focused')
    }
}
