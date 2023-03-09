import { FrameInfo } from '../../../../../transpiler/EnvironmentState'
import { createDataRenderer } from '../../EnvironmentRenderer'
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

    setState(key: string, value: DataState, frame: FrameInfo) {
        this.dataRenderer = createDataRenderer(value)
        this.dataRenderer.setState(value, frame)

        this.keyRenderer.innerText = key

        this.element.innerHTML = ''
        this.element.append(this.keyRenderer)
        this.element.append(this.dataRenderer.element)
    }

    destroy() {
        this.dataRenderer.destroy()
        this.element.remove()
    }
}
