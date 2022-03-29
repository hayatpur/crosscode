import { Action } from '../Action'
import { Representation } from './Representation'

export class CallExpressionRepresentation extends Representation {
    constructor(action: Action) {
        super(action)
        this.create()
    }

    create() {
        const action = this.action
        const { renderer, controller } = action

        renderer.controls[0].classList.remove('hidden')
        renderer.controls[0].addEventListener('click', () => {
            controller.destroyStepsAndViews()
            renderer.render(action)
        })

        renderer.controls[1].classList.remove('hidden')
        renderer.controls[1].addEventListener('click', () => {
            controller.destroyStepsAndViews()
            controller.createSteps()

            let lastView = controller.createView(action.steps.length)

            action.renderer.render(action)
        })

        action.renderer.controls[2].classList.remove('hidden')
        action.renderer.controls[2].addEventListener('click', () => {
            controller.destroyStepsAndViews()
            controller.createSteps()

            // First view
            let firstView = controller.createView(1)

            // Last view
            let lastView = controller.createView(action.steps.length)

            action.renderer.render(this.action)
        })

        action.renderer.controls[3].classList.remove('hidden')
        action.renderer.controls[3].addEventListener('click', () => {
            controller.destroyStepsAndViews()
            controller.createSteps()

            let firstView = controller.createView(1)
            let lastView = controller.createView(action.steps.length)

            action.renderer.render(this.action)
        })
    }
}
