import { DataRenderer } from '../environment/data/DataRenderer'
import { EnvironmentRenderer } from '../environment/EnvironmentRenderer'
import { LeafViewState } from './ViewState'

export class LeafViewRenderer {
    element: HTMLDivElement

    // Label
    labelElement: HTMLDivElement

    // Environment Renderer
    environmentRenderer: EnvironmentRenderer

    constructor() {
        this.element = document.createElement('div')
        this.element.classList.add('leaf-view')

        this.labelElement = document.createElement('div')
        this.labelElement.classList.add('leaf-view-label')

        this.element.append(this.labelElement)

        this.environmentRenderer = new EnvironmentRenderer()
        DataRenderer.getStage().append(this.environmentRenderer.element)
    }

    setState(state: LeafViewState) {
        // Apply transform
        this.element.style.top = `${state.transform.rendered.y}px`
        this.element.style.left = `${state.transform.rendered.x}px`

        // Render environment
        if (state._environment != null) {
            this.environmentRenderer.setState(state._environment)
        }

        // Set width and height
        this.element.style.width = `${state.transform.rendered.width}px`
        this.element.style.height = `${state.transform.rendered.height}px`

        // Set label
        this.labelElement.innerText = state.label
            .replace(/([A-Z])/g, ' $1')
            .trim()
    }

    destroy() {
        this.environmentRenderer.destroy()
        this.element.remove()
    }
}
