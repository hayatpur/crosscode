import { reads, writes } from '../../../execution/execution'
import { Action } from '../Action'
import { ActionBundle } from '../ActionBundle'
import { functionCallReturns } from '../ActionController'
import { Representation } from './Representation'

export class FunctionCallRepresentation extends Representation {
    constructor(action: Action) {
        super(action)
        this.create()
    }

    create() {
        const action = this.action
        const { renderer, controller } = action

        action.renderer.controls[0].classList.remove('hidden')
        action.renderer.controls[0].addEventListener('click', () => {
            controller.destroyStepsAndViews()

            // Render again
            renderer.render(action)
        })

        if (functionCallReturns(action.execution)) {
            renderer.controls[1].classList.remove('hidden')
            renderer.controls[1].addEventListener('click', () => {
                controller.destroyStepsAndViews()
                controller.createSteps()

                let lastStep = action.steps[action.steps.length - 1]

                // Bundle all steps except the last one
                const bundle = new ActionBundle(action, action.steps.slice(0, -1))
                action.steps = [bundle, lastStep]

                // Render again
                renderer.render(action)
            })
        }

        action.renderer.controls[2].classList.remove('hidden')
        action.renderer.controls[2].addEventListener('click', () => {
            controller.destroyStepsAndViews()
            controller.createSteps()

            // Render again
            renderer.render(action)
        })

        action.renderer.controls[3].classList.remove('hidden')
        action.renderer.controls[3].addEventListener('click', () => {
            controller.destroyStepsAndViews()
            controller.createSteps()

            // for (let i = 0; i < action.steps.length; i++) {
            //     const step = action.steps[i]
            //     if (step instanceof Action) {
            //         if (step.state.spacingDelta > 0) {
            //             step.state.spacingDelta = 0

            //             const view = controller.createView(i + 1)
            //             view.controller.setEnvironments(
            //                 [step.execution.postcondition],
            //                 [...writes(step.execution), ...reads(step.execution)].map((x) => x.id)
            //             )

            //             step.renderer.render(step)
            //         }
            //     }
            // }

            // First view
            let firstView = controller.createView(0)
            // const args = action.steps[0] as Action
            // firstView.controller.setEnvironments(
            //     [args.execution.postcondition],
            //     [...writes(args.execution)].map((x) => x.id)
            // )

            // Last view
            let lastView = controller.createView(action.steps.length)
            // const func = action.steps[1] as Action
            // lastView.controller.setEnvironments(
            //     [func.execution.postcondition],
            //     [...writes(func.execution)].map((x) => x.id)
            // )

            // Render again
            renderer.render(action)
        })

        action.renderer.controls[4].classList.remove('hidden')
        action.renderer.controls[4].addEventListener('click', () => {
            controller.destroyStepsAndViews()
            controller.createSteps()

            for (let i = 0; i < action.steps.length; i++) {
                const step = action.steps[i]
                if (step instanceof Action) {
                    step.state.spacingDelta = 0
                    step.renderer.render(step)
                }
            }

            for (let i = 1; i <= action.steps.length; i++) {
                const step = action.steps[i - 1]
                const view = controller.createView(i)

                if (step instanceof Action) {
                    view.controller.setEnvironments(
                        [step.execution.postcondition],
                        [...writes(step.execution), ...reads(step.execution)].map((x) => x.id)
                    )
                }
            }

            // Render again
            renderer.render(action)
        })
    }
}
