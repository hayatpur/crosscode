import { ConcreteIdentifierState } from '../EnvironmentState'

export class IdentifierRenderer {
    element: HTMLElement

    constructor() {
        this.element = document.createElement('div')
        this.element.classList.add('identifier')
    }

    setState(state: ConcreteIdentifierState) {
        this.element.innerHTML = state.prototype.name

        // const bbox = data.element.getBoundingClientRect();
        this.element.style.top = `${state.transform.rendered.y}px`
        this.element.style.left = `${state.transform.rendered.x}px`
    }

    destroy() {
        this.element.remove()
    }
}
