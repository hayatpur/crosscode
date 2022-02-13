import { DataRenderer } from '../data/DataRenderer'
import { PrototypicalIdentifierState } from '../EnvironmentState'

export class IdentifierRenderer {
    element: HTMLElement

    constructor() {
        this.element = document.createElement('div')
        this.element.classList.add('identifier')
    }

    select(selection: Set<string>) {
        this.element.classList.add('selected')
    }

    deselect(deselection: Set<string>) {
        this.element.classList.remove('selected')
    }

    setState(
        state: PrototypicalIdentifierState,
        data: DataRenderer,
        environmentElement: HTMLElement
    ) {
        this.element.innerHTML = `${state.name}`

        const dataBbox = data.element.getBoundingClientRect()
        const environmentBbox = environmentElement.getBoundingClientRect()

        // this.element.style.top = `${dataBbox.y - 22 - environmentBbox.y}px`
        this.element.style.top = `${18}px`
        this.element.style.left = `${dataBbox.x - environmentBbox.x}px`
    }

    destroy() {
        this.element.remove()
    }
}
