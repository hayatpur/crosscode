import { Vector } from '../../../utilities/math';

export class IndexRenderer {
    element: HTMLDivElement;

    constructor() {
        this.element = document.createElement('div');
        this.element.classList.add('data-array-index');
    }

    setState(index: number, location: Vector) {
        this.element.innerText = `${index}`;
        this.element.style.left = `${location.x}px`;
        this.element.style.top = `${location.y}px`;
    }

    destroy() {
        this.element.remove();
    }
}
