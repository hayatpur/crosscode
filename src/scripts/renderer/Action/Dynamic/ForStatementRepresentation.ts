import { createEl } from '../../../utilities/dom'
import { Action } from '../Action'
import { ActionBundle } from '../ActionBundle'
import { Representation } from './Representation'

export class ForStatementRepresentation extends Representation {
    loopRect: HTMLElement = null

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
            this.createLoopRect()

            action.steps = [new ActionBundle(action, action.steps)]

            // let lastView = controller.createView(action.steps.length)

            // const func = action.steps[1] as Action
            // lastView.controller.setEnvironments(
            //     [func.execution.postcondition],
            //     [...writes(func.execution)].map((x) => x.id)
            // )

            action.renderer.render(action)
        })

        action.renderer.controls[2].classList.remove('hidden')
        action.renderer.controls[2].addEventListener('click', () => {
            controller.destroyStepsAndViews()
            controller.createSteps()

            // First view
            // let firstView = controller.createView(0)
            // const args = action.steps[0] as Action
            // firstView.controller.setEnvironments(
            //     [args.execution.postcondition],
            //     [...writes(args.execution)].map((x) => x.id)
            // )

            // Last view
            // let lastView = controller.createView(action.steps.length)
            // const func = action.steps[1] as Action
            // lastView.controller.setEnvironments(
            //     [func.execution.postcondition],
            //     [...writes(func.execution)].map((x) => x.id)
            // )

            action.renderer.render(this.action)
        })

        action.renderer.controls[3].classList.remove('hidden')
        action.renderer.controls[3].addEventListener('click', () => {
            controller.destroyStepsAndViews()
            controller.createSteps()

            let firstView = controller.createView(0)
            let lastView = controller.createView(action.steps.length)

            action.renderer.render(this.action)
        })
    }

    createLoopRect() {
        this.loopRect = createEl('div', 'loop-rect', this.action.renderer.header)
    }

    destroyLoopRect() {
        this.loopRect?.remove()
        this.loopRect = null
    }

    destroy() {
        this.destroyLoopRect()
    }
}
