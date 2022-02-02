import { instanceOfAnimationGraph } from '../../animation/graph/AnimationGraph'
import { createView } from '../../utilities/view'
import { Timeline } from '../Timeline/Timeline'
import { View } from '../View'
import { ViewController } from '../ViewController'
import { ViewRenderer } from '../ViewRenderer'

export class ForStatementView extends View {}

export class ForStatementViewRenderer extends ViewRenderer {}

export class ForStatementViewController extends ViewController {
    createHardSteps(expanded: boolean = false) {
        this.view.stepsTimeline = new Timeline()

        const bbox = this.view.renderer.element.getBoundingClientRect()
        this.view.stepsTimeline.transform.position.x =
            bbox.left + bbox.width + 50
        this.view.stepsTimeline.transform.position.y = bbox.top

        if (instanceOfAnimationGraph(this.view.originalAnimation)) {
            const vertices = this.view.originalAnimation.vertices
            for (let i = 1; i < vertices.length - 1; i++) {
                const step = createView(vertices[i])
                if (expanded) {
                    step.controller.expand()
                }
                this.view.stepsTimeline.addView(step)
            }
        }
    }
}
