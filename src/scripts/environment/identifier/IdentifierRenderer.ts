import { IdentifierState } from '../EnvironmentState';

export class IdentifierRenderer {
    element: HTMLElement;

    constructor() {
        this.element = document.createElement('div');
        this.element.classList.add('identifier');
    }

    setState(state: IdentifierState) {
        this.element.innerHTML = state.name;

        // const bbox = data.element.getBoundingClientRect();
        this.element.style.top = `${state.transform.rendered.y}px`;
        this.element.style.left = `${state.transform.rendered.x}px`;
    }

    destroy() {
        this.element.remove();
    }
}
