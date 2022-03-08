import { Action, CreateActionOptions } from '../Action/Action'
import { TimelineController } from './TimelineController'
import { TimelineRenderer } from './TimelineRenderer'
import { createTimelineState, TimelineState } from './TimelineState'

/* ------------------------------------------------------ */
/*                  Timeline of an action                 */
/* ------------------------------------------------------ */
export class Timeline {
    action: Action

    state: TimelineState
    renderer: TimelineRenderer
    controller: TimelineController

    steps: Action[] = null

    constructor(action: Action, options: CreateActionOptions) {
        this.action = action

        this.state = createTimelineState()
        this.renderer = new TimelineRenderer()
        this.controller = new TimelineController(this)

        if (options.shouldExpand) {
            this.controller.expand()
        }

        if (options.shouldShowSteps) {
            this.controller.showSteps()
        }
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        this.controller.destroy()
        this.renderer.destroy()
    }
}
