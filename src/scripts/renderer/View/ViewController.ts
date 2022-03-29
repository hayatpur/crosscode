import { EnvironmentState } from '../../environment/EnvironmentState'
import { View } from './View'

export class ViewController {
    view: View

    /* ----------------------- Create ----------------------- */

    constructor(view: View) {
        this.view = view

        // this.view.renderer.element.addEventListener('click', this.toggleHidden.bind(this))
    }

    toggleHidden() {
        this.view.renderer.element.classList.toggle('hidden')
    }

    tick(dt: number) {}

    setEnvironments(environments: EnvironmentState[], filter?: string[]) {
        this.view.environments = environments
        this.view.renderer.render(this.view, filter)
    }

    /* ------------------------ Focus ----------------------- */

    unfocus() {
        for (const env of this.view.renderer.environmentRenderers) {
            env.unfocus()
        }
    }

    secondaryFocus(dataIds: Set<string>) {
        for (const env of this.view.renderer.environmentRenderers) {
            env.secondaryFocus(dataIds)
        }
    }

    focus(dataIds: Set<string>) {
        for (const env of this.view.renderer.environmentRenderers) {
            env.focus(dataIds)
        }
    }

    clearFocus() {
        for (const env of this.view.renderer.environmentRenderers) {
            env.clearFocus()
        }
    }

    /* ----------------------- Destroy ---------------------- */

    destroy() {}
}
