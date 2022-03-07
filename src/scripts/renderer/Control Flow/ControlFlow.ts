import { getLeavesOfView } from '../../execution/graph/graph'
import { View } from '../Action/Action'
import { ControlFlowArrow } from './ControlFlowArrow'

export class ControlFlow {
    arrows: ControlFlowArrow[] = []
    view: View

    constructor(view: View) {
        this.view = view

        // Initialize
        if (this.view.state.isShowingSteps) {
            // Create arrows between leaves
            const leaves = getLeavesOfView(this.view)

            for (let i = 0; i < leaves.length - 1; i++) {
                const arrow = new ControlFlowArrow(leaves[i], leaves[i + 1])
                this.arrows.push(arrow)
            }
        } else {
            this.arrows.push(new ControlFlowArrow(this.view, this.view))
            // Create arrows depending on type of statement
        }
    }

    tick(dt: number) {
        for (const arrow of this.arrows) {
            arrow.tick(dt)
        }
    }

    destroy() {
        for (const arrow of this.arrows) {
            arrow.destroy()
        }
        this.arrows = null
    }
}
