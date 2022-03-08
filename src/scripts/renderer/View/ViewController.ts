import { View } from './View'

export class ViewController {
    view: View

    /* ----------------------- Create ----------------------- */

    constructor(view: View) {
        this.view = view
    }

    tick(dt: number) {}

    /* ----------------------- Destroy ---------------------- */

    destroy() {}
}
