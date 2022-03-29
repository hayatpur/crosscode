import { createEl } from '../../utilities/dom'
import { EnvironmentRenderer } from './Environment/EnvironmentRenderer'
import { View } from './View'

/* ------------------------------------------------------ */
/*                      View Renderer                     */
/* ------------------------------------------------------ */
export class ViewRenderer {
    // Container
    element: HTMLElement

    // Stack of environment renderers
    environmentRenderers: EnvironmentRenderer[] = []

    /* ----------------------- Create ----------------------- */
    constructor() {
        this.create()
    }

    create() {
        this.element = createEl('div', 'view')
    }

    createEnvironmentRenderer() {
        const renderer = new EnvironmentRenderer()
        this.element.appendChild(renderer.element)
        return renderer
    }

    /* ----------------------- Render ----------------------- */
    render(view: View, filter?: string[]) {
        // Render environments
        for (let i = 0; i < view.environments.length; i++) {
            if (this.environmentRenderers.length <= i) {
                this.environmentRenderers.push(this.createEnvironmentRenderer())
            }

            this.environmentRenderers[i].render(view.environments[i], filter)
        }

        // Cleanup unused renderers
        while (this.environmentRenderers.length > view.environments.length) {
            const renderer = this.environmentRenderers.pop()
            renderer.destroy()
        }
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        for (const renderer of this.environmentRenderers) {
            renderer.destroy()
        }
        this.environmentRenderers = []

        this.element.remove()
        this.element = null
    }
}
