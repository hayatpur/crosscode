import { Executor } from '../../executor/Executor'
import { View } from './View'

export class ViewController {
    view: View

    /* ----------------------- Create ----------------------- */

    constructor(view: View) {
        this.view = view

        this.view.renderer.element.addEventListener('click', () => {
            this.view.renderer.element.classList.toggle('hidden')
            setTimeout(() => Executor.instance.visualization.updateAllConnections(), 200)
        })
    }

    tick(dt: number) {}

    /* ----------------------- Destroy ---------------------- */

    destroy() {}
}
