import { Executor } from '../../executor/Executor'
import { View } from './View'

export class ViewController {
    view: View

    /* ----------------------- Create ----------------------- */

    constructor(view: View) {
        this.view = view
        // this.toggleHidden()

        this.view.renderer.element.addEventListener('click', this.toggleHidden.bind(this))
    }

    toggleHidden() {
        this.view.renderer.element.classList.toggle('hidden')
        setTimeout(() => Executor.instance.visualization.updateAllConnections(), 200)
    }

    tick(dt: number) {}

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
