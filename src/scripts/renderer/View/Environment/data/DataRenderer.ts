import { FrameInfo } from '../../../../environment/EnvironmentState'
import { DataState } from './DataState'

export class DataRenderer {
    element: HTMLDivElement
    array: DataRenderer[]

    _cachedState: DataState | null = null

    constructor() {
        this.element = document.createElement('div')
        this.element.classList.add('data')
    }

    setState(data: DataState, frame: FrameInfo) {
        console.warn('No fallback for', data)
    }

    destroy() {
        this.element.remove()
    }

    getAllChildRenderers(): { [id: string]: DataRenderer } {
        return {}
    }

    /* ------------------------ Focus ----------------------- */
    secondaryFocus() {
        this.element.classList.add('secondary-focused')
    }

    focus() {
        this.element.classList.remove('secondary-focused')
    }

    clearFocus() {
        this.element.classList.remove('secondary-focused')
    }
}
