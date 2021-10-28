import { DataState } from './DataState';

export class DataRenderer {
    element: HTMLDivElement;
    array: DataRenderer[];

    static getStage(): HTMLDivElement {
        return document.getElementById('renderer-stage') as HTMLDivElement;
    }

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
