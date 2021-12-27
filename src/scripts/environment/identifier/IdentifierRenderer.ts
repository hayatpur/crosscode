import { DataRenderer } from '../data/DataRenderer'
import { PrototypicalIdentifierState } from '../EnvironmentState'

export class IdentifierRenderer {
    element: HTMLElement

    constructor() {
        this.element = document.createElement('div')
        this.element.classList.add('identifier')
    }

    setState(
        state: PrototypicalIdentifierState,
        data: DataRenderer,
        environmentElement: HTMLElement
    ) {
        this.element.innerHTML = `${state.name}`

        const dataBbox = data.element.getBoundingClientRect()
        const environmentBbox = environmentElement.getBoundingClientRect()

        this.element.style.top = `${dataBbox.y - 14 - environmentBbox.y}px`
        this.element.style.left = `${dataBbox.x + 8 - environmentBbox.x}px`
    }

    destroy() {
        this.element.remove()
    }
}
