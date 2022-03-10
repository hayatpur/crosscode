import { ExecutionGraph, instanceOfExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
import { Action } from '../Action/Action'
import { Timeline } from './Timeline'

/* ------------------------------------------------------ */
/*          Defines interactions with a Timeline          */
/* ------------------------------------------------------ */
export class TimelineController {
    timeline: Timeline

    constructor(timeline: Timeline) {
        this.timeline = timeline
    }

    /* ----------------- Collapse and expand ---------------- */

    collapse() {
        this.timeline.state.isCollapsed = true
        this.timeline.renderer.render(this.timeline)
    }

    expand() {
        this.timeline.state.isCollapsed = false
        this.timeline.renderer.render(this.timeline)
    }

    /* --------------------- Show steps --------------------- */

    // TODO: Be able to specify what steps to show
    showSteps() {
        this.timeline.state.isShowingSteps = true

        // Create steps
        // TODO: Deal with execution nodes
        this.timeline.steps = []
        this.timeline.trailGroups = []

        for (const step of getExecutionSteps(this.timeline.action.execution)) {
            const action = new Action(step, { shouldExpand: false, shouldShowSteps: false })
            this.timeline.steps.push(action)
        }

        // Render them so they're in the right place
        this.timeline.renderer.render(this.timeline)

        // Create trail groups
        // for (let i = 0; i < this.timeline.steps.length; i++) {
        //     const step = this.timeline.steps[i]
        //     // console.log(
        //     //     this.timeline.renderer.views[i].renderer.environmentRenderers[0],
        //     //     this.timeline.renderer.views[i + 1].renderer.environmentRenderers[0]
        //     // )
        //     const startEnvs = this.timeline.renderer.views[i].renderer.environmentRenderers
        //     const endEnvs = this.timeline.renderer.views[i + 1].renderer.environmentRenderers
        //     const trails = new TrailGroup(
        //         step,
        //         startEnvs[startEnvs.length - 1],
        //         endEnvs[endEnvs.length - 1]
        //     )
        //     this.timeline.trailGroups.push(trails)
        // }
    }

    hideSteps() {
        this.timeline.state.isShowingSteps = false

        // Destroy steps
        this.timeline.steps?.forEach((step) => step.destroy())
        this.timeline.steps = null

        // Destroy trail groups
        this.timeline.trailGroups?.forEach((trailGroup) => trailGroup.destroy())
        this.timeline.trailGroups = null

        // Render again
        this.timeline.renderer.render(this.timeline)
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {}
}

/* ------------------------------------------------------ */
/*                    Helper functions                    */
/* ------------------------------------------------------ */
// ? Apply blacklist
export function getExecutionSteps(
    execution: ExecutionGraph | ExecutionNode
): (ExecutionGraph | ExecutionNode)[] {
    if (instanceOfExecutionGraph(execution)) {
        return execution.vertices
    } else {
        return []
    }
}
