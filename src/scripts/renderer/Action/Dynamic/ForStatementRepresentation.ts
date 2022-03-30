import { ExecutionGraph } from '../../../execution/graph/ExecutionGraph'
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
            this.destroyLoopRect()
            this.action.renderer.body.classList.remove('show-iterations')

            renderer.render(action)
        })

        renderer.controls[1].classList.remove('hidden')
        renderer.controls[1].addEventListener('click', () => {
            controller.destroyStepsAndViews()
            this.destroyLoopRect()
            this.action.renderer.body.classList.remove('show-iterations')

            controller.createSteps()
            this.createLoopRect()

            action.steps = [new ActionBundle(action, action.steps)]

            action.renderer.render(action)
        })

        action.renderer.controls[2].classList.remove('hidden')
        action.renderer.controls[2].addEventListener('click', () => {
            controller.destroyStepsAndViews()
            this.destroyLoopRect()
            this.action.renderer.body.classList.remove('show-iterations')

            controller.createSteps()
            this.createLoopRect()

            // Shows iterations
            this.action.renderer.body.classList.add('show-iterations')
            this.action.steps.forEach((s) => s.renderer.element.classList.add('iteration'))
            this.action.steps[0].renderer.element.classList.add('selected')

            const iteration = new Action(
                ((action.execution as ExecutionGraph).vertices[0] as ExecutionGraph).vertices[2],
                action,
                { inline: true }
            )

            action.steps = [iteration, ...action.steps]

            action.renderer.render(action)
        })

        action.renderer.controls[3].classList.remove('hidden')
        action.renderer.controls[3].addEventListener('click', () => {
            controller.destroyStepsAndViews()
            this.destroyLoopRect()
            this.action.renderer.body.classList.remove('show-iterations')

            controller.createSteps()
            this.createLoopRect()

            // action.steps = [new ActionBundle(action, action.steps)]

            action.renderer.render(action)
        })
    }

    createLoopRect() {
        this.loopRect = createEl('div', 'loop-rect', this.action.renderer.element)
    }

    destroyLoopRect() {
        this.loopRect?.remove()
        this.loopRect = null
    }

    destroy() {
        this.destroyLoopRect()
    }
}
