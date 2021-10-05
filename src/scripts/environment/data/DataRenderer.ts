import { EnvironmentRenderer } from '../EnvironmentRenderer';
import { DataState } from './DataState';

export interface DataRendererOptions {
    zOffset?: number;
    environmentRenderer: EnvironmentRenderer;
}

export class DataRenderer {
    static Padding = 40;

    element: HTMLDivElement;
    array: DataRenderer[];

    constructor() {
        this.element = document.createElement('div');
        this.element.classList.add('data');
    }

    setState(data: DataState, options: DataRendererOptions) {
        console.warn('No fallback for', data.type);
    }

    destroy() {
        this.element.remove();
    }
}
