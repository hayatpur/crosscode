import { DataRenderer } from '../environment/data/DataRenderer'
import { EnvironmentRenderer } from '../environment/EnvironmentRenderer'
import { LeafViewState } from './ViewState'

export class LeafViewRenderer {
    element: HTMLDivElement

    // Label
    labelElement: HTMLDivElement
    labelTextElement: HTMLDivElement
    labelEdgeElement: HTMLDivElement

    // Environment Renderer
    environmentRenderer: EnvironmentRenderer

    constructor() {
        this.element = document.createElement('div')
        this.element.classList.add('view')

        this.labelElement = document.createElement('div')
        this.labelElement.classList.add('view-label')

        this.labelEdgeElement = document.createElement('div')
        this.labelEdgeElement.classList.add('view-label-edge')
        this.labelElement.append(this.labelEdgeElement)

        this.labelTextElement = document.createElement('div')
        this.labelTextElement.classList.add('view-label-text')
        this.labelElement.append(this.labelTextElement)

        this.element.append(this.labelElement)

        this.environmentRenderer = new EnvironmentRenderer()
        DataRenderer.getStage().append(this.environmentRenderer.element)
    }

    setState(state: LeafViewState) {
        // Apply transform
        this.element.style.top = `${state.transform.rendered.y}px`
        this.element.style.left = `${state.transform.rendered.x}px`

        // Render environment
        this.environmentRenderer.setState(state._environment)

        // Set width and height
        this.element.style.width = `${state.transform.rendered.width}px`
        this.element.style.height = `${state.transform.rendered.height}px`

        // Set label
        this.labelTextElement.innerText = state.label
    }

    destroy() {
        this.environmentRenderer.destroy()
        this.element.remove()
    }
}
