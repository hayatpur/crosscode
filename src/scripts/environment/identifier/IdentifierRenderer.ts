import { DataRenderer } from '../data/DataRenderer'
import { PrototypicalIdentifierState } from '../EnvironmentState'

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

    setState(
        state: PrototypicalIdentifierState,
        data: DataRenderer,
        environmentElement: HTMLElement
    ) {
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

        // this.element.style.top = `${dataBbox.y - 22 - environmentBbox.y}px`
        const delta = dataBbox.x - environmentBbox.x

        let ratio = 1
        // if (this.environmentReference.children.length > 0) {
        // ratio = dataBbox.height / 30
        // }
        this.element.style.top = `${18}px`
        this.element.style.left = `${(1 / ratio) * delta}px`
    }

    destroy() {
        this.element.remove()
        this.reference = null
    }
}
