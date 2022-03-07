import { createDataRenderer } from '../../../renderer/View/EnvironmentRenderer'
import { DataRenderer } from '../DataRenderer'
import { DataState } from '../DataState'

export class ObjectItemRenderer {
    keyRenderer: HTMLElement
    dataRenderer: DataRenderer

    element: HTMLElement

    constructor() {
        this.element = document.createElement('div')
        this.element.classList.add('data-object-item')
        this.keyRenderer = document.createElement('div')
        this.keyRenderer.classList.add('data-object-item-key')
    }

    setState(key: string, value: DataState) {
        this.dataRenderer = createDataRenderer(value)
        this.dataRenderer.setState(value)

        this.keyRenderer.innerText = key

        this.element.append(this.keyRenderer)
        this.element.append(this.dataRenderer.element)
    }

    destroy() {
        this.dataRenderer.destroy()
        this.element.remove()
    }
}
