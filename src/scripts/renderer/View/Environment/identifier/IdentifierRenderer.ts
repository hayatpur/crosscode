import { IdentifierState } from '../../../../environment/EnvironmentState'
import { Executor } from '../../../../executor/Executor'
import { getNumericalValueOfStyle, lerp } from '../../../../utilities/math'
import { Ticker } from '../../../../utilities/Ticker'
import { DataRenderer } from '../data/DataRenderer'

export class IdentifierRenderer {
    element: HTMLElement
    reference: HTMLElement
    environmentReference: HTMLElement

    private _tickerId: string

    constructor() {
        this.element = document.createElement('div')
        this.element.classList.add('identifier')

        this._tickerId = Ticker.instance.registerTick(this.tick.bind(this))
    }

    select(selection: Set<string>) {
        this.element.classList.add('selected')
    }

    deselect() {
        this.element.classList.remove('selected')
    }

    setState(state: IdentifierState, data: DataRenderer, environmentElement: HTMLElement) {
        this.element.innerHTML = `${state.name}`

        this.reference = data.element
        this.environmentReference = environmentElement
    }

    tick(dt: number) {
        if (this.reference == null) {
            return
        }

        const dataBbox = this.reference.getBoundingClientRect()
        const environmentBbox = this.environmentReference.getBoundingClientRect()

        let delta = dataBbox.x - environmentBbox.x
        const scale = getNumericalValueOfStyle(
            Executor.instance.visualization.camera.element.style.transform.substring(6),
            1
        )
        delta /= scale

        const prevLeft = getNumericalValueOfStyle(this.element.style.left, delta)

        this.element.style.left = `${lerp(prevLeft, delta, 0.2)}px`
    }

    destroy() {
        Ticker.instance.removeTickFrom(this._tickerId)
        this.element.remove()
        this.reference = null
    }
}
