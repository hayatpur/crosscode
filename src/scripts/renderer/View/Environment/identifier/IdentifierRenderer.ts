import { IdentifierState } from '../../../../environment/EnvironmentState'
import { Ticker } from '../../../../utilities/Ticker'

export class IdentifierRenderer {
    element: HTMLElement
    environmentReference: HTMLElement

    private _tickerId: string

    constructor() {
        this.element = document.createElement('div')
        this.element.classList.add('identifier')

        this._tickerId = Ticker.instance.registerTick(this.tick.bind(this))
    }

    setState(state: IdentifierState) {
        this.element.innerHTML = `${state.name}`
    }

    tick(dt: number) {}

    destroy() {
        Ticker.instance.removeTickFrom(this._tickerId)
        this.element.remove()
    }

    /* ------------------------ Focus ----------------------- */
    unfocus() {
        this.element.classList.add('unfocused')
    }

    secondaryFocus() {
        console.log('Secondary focus', this.element.innerText)
        this.element.classList.remove('unfocused')
        this.element.classList.add('secondary-focused')
    }

    focus() {
        this.element.classList.remove('unfocused')
        this.element.classList.remove('secondary-focused')
    }

    clearFocus() {
        this.element.classList.remove('unfocused')
        this.element.classList.remove('secondary-focused')
    }
}
