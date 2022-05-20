import { Action } from '../Action/Action'
import { TrailGroup } from '../Trail/TrailGroup'
import { ViewController } from './ViewController'
import { ViewRenderer } from './ViewRenderer'
import { createViewState, ViewState } from './ViewState'

/* ------------------------------------------------------ */
/*        View displays a series of program states        */
/* ------------------------------------------------------ */
export class View {
    // Corresponding action
    action: Action

    // State, renderer, controller
    state: ViewState
    renderer: ViewRenderer
    controller: ViewController

    // Like animation paths (that are acting on a given animation)
    trails: TrailGroup[] = []

    // Flag for if it needs to re-render
    dirty: boolean = true

    constructor(action: Action) {
        this.action = action

        this.state = createViewState()
        this.renderer = new ViewRenderer(this)
        this.controller = new ViewController(this)
    }

    /* ----------------------- Destroy ---------------------- */

    destroy() {
        this.controller.destroy()
        this.renderer.destroy()
    }
}
