import { View } from './View'

export class ViewController {
    view: View

    /* ----------------------- Create ----------------------- */

    constructor(view: View) {
        this.view = view

        this.setFrames()
    }

    setFrames() {
        this.view.frames = []

        // Start with the frames of the action
        const allSteps = this.view.action.getAllFrames()

        this.view.frames.push(this.view.action.execution.precondition)
        allSteps.forEach((step) => this.view.frames.push(step.execution.postcondition))
        this.view.frames.push(this.view.action.execution.postcondition)

        this.view.renderer.render(this.view)

        console.log('Setting frames...', this.view.frames.length)
    }

    toggleHidden() {
        this.view.renderer.element.classList.toggle('hidden')
    }

    // setExecutions(frames: EnvironmentState[], filter?: string[]) {
    //     this.view.frames = frames
    //     this.view.renderer.render(this.view, filter)
    // }

    /* ------------------------ Focus ----------------------- */

    unfocus() {
        for (const env of this.view.renderer.environmentRenderers) {
            env.unfocus()
        }
    }

    secondaryFocus(dataIds: Set<string>) {
        for (const env of this.view.renderer.environmentRenderers) {
            env.secondaryFocus(dataIds)
        }
    }

    focus(dataIds: Set<string>) {
        for (const env of this.view.renderer.environmentRenderers) {
            env.focus(dataIds)
        }
    }

    clearFocus() {
        for (const env of this.view.renderer.environmentRenderers) {
            env.clearFocus()
        }
    }

    /* ----------------------- Destroy ---------------------- */

    destroy() {}
}
