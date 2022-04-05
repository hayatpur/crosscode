import { EnvironmentState } from '../../environment/EnvironmentState'
import { Action } from '../Action/Action'
import { TrailGroup } from '../Trail/TrailGroup'
import { ViewController } from './ViewController'
import { ViewRenderer } from './ViewRenderer'
import { createViewState, ViewState } from './ViewState'

/* ------------------------------------------------------ */
/*        View displays a series of program states        */
/* ------------------------------------------------------ */
export class View {
    action: Action

    state: ViewState
    renderer: ViewRenderer
    controller: ViewController
    frames: EnvironmentState[] = []
    trails: { [id: string]: TrailGroup } = {}

    timeOffset: number = 0

    constructor(action: Action, timeOffset: number = 0) {
        this.action = action

        this.timeOffset = timeOffset

        this.state = createViewState()
        this.renderer = new ViewRenderer()
        this.controller = new ViewController(this)

        this.renderer.render(this)
    }

    /* ----------------------- Destroy ---------------------- */

    destroy() {
        this.controller.destroy()
        this.renderer.destroy()
    }
}
