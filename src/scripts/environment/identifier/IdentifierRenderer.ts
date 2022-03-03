import { DataRenderer } from '../data/DataRenderer'
import { IdentifierState } from '../EnvironmentState'

export class IdentifierRenderer {
    element: HTMLElement
    reference: HTMLElement
    environmentReference: HTMLElement

    constructor() {
        this.element = document.createElement('div')
        this.element.classList.add('identifier')
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

        this.element.style.top = `${18}px`
        this.element.style.left = `${delta}px`
    }

    destroy() {
        this.element.remove()
        this.reference = null
    }
}
