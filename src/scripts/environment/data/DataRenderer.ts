import { DataState } from './DataState';

export class DataRenderer {
    static Padding = 20;

    element: HTMLDivElement;
    array: DataRenderer[];

    constructor() {
        this.element = document.createElement('div');
        this.element.classList.add('data');
    }

    setState(data: DataState) {
        console.warn('No fallback for', data.type);
    }

    destroy() {
        this.element.remove();
    }
}
