import { PrototypicalDataState } from './DataState'

export class DataRenderer {
    element: HTMLDivElement
    array: DataRenderer[]

    constructor() {
        this.element = document.createElement('div')
        this.element.classList.add('data')
    }

    setState(data: PrototypicalDataState) {
        console.warn('No fallback for', data)
    }

    destroy() {
        this.element.remove()
    }
}
