import { DataState } from '../data/DataState';

export class IdentifierRenderer {
    element: HTMLElement;

    constructor() {
        this.element = document.createElement('div');
        this.element.classList.add('identifier');

        setTimeout(() => (this.element.style.transform = `scale(1)`));
    }

    setState(name: string, data: DataState) {
        this.element.innerHTML = name;

        // const bbox = data.element.getBoundingClientRect();
        this.element.style.top = `${data.transform.y - 32}px`;
        this.element.style.left = `${data.transform.x - 3}px`;
    }

    destroy() {
        this.element.remove();
    }
}
