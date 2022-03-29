import { EnvironmentState } from '../../environment/EnvironmentState'
import { ViewController } from './ViewController'
import { ViewRenderer } from './ViewRenderer'
import { createViewState, ViewState } from './ViewState'

/* ------------------------------------------------------ */
/*        View displays a series of program states        */
/* ------------------------------------------------------ */
export class View {
    state: ViewState
    renderer: ViewRenderer
    controller: ViewController

    environments: EnvironmentState[] = []

    constructor() {
        this.state = createViewState()
        this.renderer = new ViewRenderer()
        this.controller = new ViewController(this)
    }

    /* ----------------------- Destroy ---------------------- */

    destroy() {
        this.controller.destroy()
        this.renderer.destroy()
    }
}
