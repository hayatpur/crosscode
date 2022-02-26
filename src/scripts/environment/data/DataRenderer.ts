import { DataState } from './DataState'

export class DataRenderer {
    element: HTMLDivElement
    array: DataRenderer[]

    constructor() {
        this.element = document.createElement('div')
        this.element.classList.add('data')
    }

    setState(data: DataState) {
        console.warn('No fallback for', data)
    }

    destroy() {
        this.element.remove()
    }

    getAllChildRenderers(): { [id: string]: DataRenderer } {
        return {}
    }

    select(selection: Set<string>) {
        this.element.classList.add('selected')
    }

    deselect() {
        this.element.classList.remove('selected')
    }

    fadeOut() {
        this.element.style.opacity = '0.5'
    }
}
