import { Executor } from '../../executor/Executor'
import { Ticker } from '../../utilities/Ticker'
import { Action, CreateActionOptions } from '../Action/Action'
import { TrailGroup } from '../Trail/TrailGroup'
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
    trailGroups: TrailGroup[] = []

    base: SVGPathElement

    _tickerId: string

    constructor(action: Action, options: CreateActionOptions) {
        this.action = action

        this.state = createTimelineState()
        this.renderer = new TimelineRenderer()
        this.controller = new TimelineController(this)

        if (options.shouldExpand) {
            this.controller.expand()
        } else {
            this.controller.collapse()
        }

        if (options.shouldShowSteps) {
            this.controller.showSteps()
        } else {
            this.controller.hideSteps()
        }

        if (options.isRoot) {
            this.controller.makeRoot()
        }

        this.renderer.render(this)

        this._tickerId = Ticker.instance.registerTick(this.tick.bind(this))

        Executor.instance.visualization.timelines.push(this)
    }

    tick() {
        if (this.action != Executor.instance.visualization.root) {
            return
        }

        // Create a base path
        // if (!this.base) {
        //     const connection = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        //     connection.classList.add('timeline-base')
        //     document.getElementById('svg-canvas').append(connection)
        //     this.base = connection
        // }

        // let points = [...document.querySelectorAll('.timeline-anchor')]
        //     .map((el) => el.getBoundingClientRect())
        //     .map((bbox) => [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2])
        //     .sort((p1, p2) => p2[1] - p1[1])
        //     .flat()

        // First and last point
        // if (!this.state.isCollapsed && this.renderer.views != null) {
        //     let xOff = points[0]
        //     const startBbox = this.renderer.views[0]?.renderer?.element?.getBoundingClientRect()
        //     if (startBbox) {
        //         points.unshift(xOff, startBbox.y + startBbox.height)
        //     }

        //     const endBbox =
        //         this.renderer.views[
        //             this.renderer.views.length - 1
        //         ]?.renderer?.element?.getBoundingClientRect()
        //     if (endBbox) {
        //         points.push(xOff, endBbox.y)
        //     }
        // }

        // let d = catmullRomSolve(points, Executor.instance.PARAMS.a)
        // this.base.setAttribute('d', d)
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        Executor.instance.visualization.timelines.splice(
            Executor.instance.visualization.timelines.indexOf(this),
            1
        )
        Ticker.instance.removeTickFrom(this._tickerId)
        this.controller.destroy()
        this.renderer.destroy()
        this.base?.remove()
    }
}
