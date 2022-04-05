import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
import { View } from './View'

export class ViewController {
    view: View

    // _tickerId: string

    /* ----------------------- Create ----------------------- */

    constructor(view: View) {
        this.view = view

        // document.addEventListener('keydown', (e) => {
        //     if (!this.cursorSelected) return

        //     if (e.key == 'ArrowUp') {
        //         if (this.position > 0) {
        //             this.position -= 1
        //         }
        //     } else if (e.key == 'ArrowDown') {
        //         const allSteps = getAllSteps(this.action)
        //         if (this.position < allSteps.length - 1) {
        //             this.position += 1
        //         }
        //     }
        // })

        // this._tickerId = Ticker.instance.registerTick(this.tick.bind(this))
    }

    getTime(index: number) {
        return this.view.executions.length == 1
            ? 0.5
            : (index + 1) / (this.view.executions.length + 1)
    }

    updateTime(time: number) {
        this.view.state.time = time
        this.view.renderer.updateTime(this.view)

        if (time == 0) {
            this.view.renderer.element.classList.add('inactive')
        } else {
            this.view.renderer.element.classList.remove('inactive')
        }
    }

    toggleHidden() {
        this.view.renderer.element.classList.toggle('hidden')
    }

    setExecutions(executions: (ExecutionGraph | ExecutionNode)[], filter?: string[]) {
        this.view.executions = executions
        this.view.renderer.render(this.view, filter)
    }

    clearExecutions() {
        this.view.executions = []

        this.view.renderer.render(this.view)
    }

    addExecution(execution: ExecutionGraph | ExecutionNode) {
        this.view.executions.push(execution)
        this.view.renderer.render(this.view)
    }

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
