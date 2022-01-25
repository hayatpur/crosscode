import { instanceOfAnimationGraph } from '../../animation/graph/AnimationGraph'
import { createView } from '../../utilities/view'
import { ViewController } from '../ViewController'

export class ForStatementViewController extends ViewController {
    createSteps() {
        const { state, renderer } = this.view

        this.resetAnimation([])

        renderer.stepsContainer.classList.remove('hidden')

        if (instanceOfAnimationGraph(this.view.originalAnimation)) {
            const vertices = this.view.originalAnimation.vertices
            for (let i = 1; i < vertices.length - 1; i++) {
                const child = vertices[i]
                const step = createView(child)
                this.anchorView(step)

                this.view.steps.push(step)
            }
        }

        renderer.element.classList.add('showing-steps')
        state.isShowingSteps = true
    }
}
