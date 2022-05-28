import { getActionSpatialRoot, getExecutionSteps } from '../../utilities/action'
import { Action } from './Action'

/* ------------------------------------------------------ */
/*           Defines interactions with an Action          */
/* ------------------------------------------------------ */
export class ActionController {
    action: Action

    constructor(action: Action) {
        this.action = action
    }

    /* ------------------------ Steps ----------------------- */
    createSteps() {
        if (this.action.state.isShowingSteps) {
            console.warn('Steps already created! Destroying existing.')
            this.action.steps.forEach((step) => step.destroy())
        }

        this.action.steps = []

        let steps = getExecutionSteps(this.action.execution)

        for (let i = 0; i < steps.length; i++) {
            const action = new Action(steps[i], this.action, {
                isInline: true,
                isIndented: this.action.execution.nodeData.type == 'BlockStatement',
            })
            this.action.steps.push(action)
        }

        this.action.state.isShowingSteps = true

        if (!this.action.state.isInline) {
            // Update the mapping
            this.action.mapping.dirty = true

            // Update the view
            this.updateFrames()
        }

        getActionSpatialRoot(this.action).dirty = true
        this.action.dirty = true
    }

    updateFrames() {
        // TODO Dynamic mapping!
        this.action.view.controller.setFrames(
            this.action.representation.getFrames(),
            this.action.execution.precondition
        )
    }

    destroySteps() {
        this.action.steps.forEach((step) => step.destroy())
        this.action.steps = []

        getActionSpatialRoot(this.action).dirty = true
        this.action.dirty = true
    }

    removeStep(step: Action) {
        const index = this.action.steps.indexOf(step)
        if (index > -1) {
            this.action.steps.splice(index, 1)
        } else {
            console.warn('Step not found!')
        }
    }

    /* ------------------------ Focus ----------------------- */
    focus() {
        this.action.renderer.element.classList.add('is-focused')

        const tokens = [
            ...this.action.renderer.header.querySelectorAll('.action-label > span > span'),
        ]

        if (this.action.renderer.footer != null) {
            tokens.push(
                ...this.action.renderer.footer.querySelectorAll('.action-label > span > span')
            )
        }

        tokens.forEach((token) => {
            token.classList.add('is-focused')
        })

        this.action.proxy.focus()
    }

    unfocus() {
        this.action.renderer.element.classList.remove('is-focused')
        this.action.proxy?.unfocus()
    }

    clearFocus() {
        this.action.renderer.element.classList.remove('is-focused')
        this.action.proxy?.clearFocus()
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {}
}
