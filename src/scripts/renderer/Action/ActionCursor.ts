import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
import { Executor } from '../../executor/Executor'
import { getAllSteps } from '../../utilities/action'
import { createEl } from '../../utilities/dom'
import { Ticker } from '../../utilities/Ticker'
import { Action } from './Action'

export class ActionCursor {
    element: HTMLElement
    action: Action

    active: boolean = false
    position: number = 0

    _tickerId: string
    _currentFocus: ExecutionGraph | ExecutionNode

    /* ----------------------- Create ----------------------- */
    constructor(action: Action) {
        this.action = action

        this.create()

        this.element.addEventListener('click', () => {
            this.active = !this.active
            let activeElement = document.activeElement as HTMLElement
            activeElement.blur()
            // Editor.instance.monaco.getDomNode().parentElement.blur()

            if (this.active) {
                this.element.classList.add('active')
            } else {
                this.element.classList.remove('active')
            }
        })

        document.addEventListener('keydown', (e) => {
            if (!this.active) return

            if (e.key == 'ArrowUp') {
                if (this.position > 0) {
                    this.position -= 1
                }
            } else if (e.key == 'ArrowDown') {
                const allSteps = getAllSteps(this.action)
                if (this.position < allSteps.length - 1) {
                    this.position += 1
                }
            }
        })

        this._tickerId = Ticker.instance.registerTick(this.tick.bind(this))
    }

    create() {
        this.element = createEl('div', 'action-cursor', this.action.renderer.body)
    }

    /* ----------------------- Update ----------------------- */
    tick(dt: number) {
        if (this.active) {
            const allSteps = getAllSteps(this.action)

            // Move to current position
            const step = allSteps[this.position]
            const stepBbox = step.renderer.element.getBoundingClientRect()
            const parentBbox = this.action.renderer.body.getBoundingClientRect()
            this.element.style.top = `${stepBbox.y - parentBbox.y + 10}px`

            let execution = step instanceof Action ? step.execution : step.getPostExecution()

            // Focus
            if (this._currentFocus != execution) {
                // Unfocus
                if (this._currentFocus != null) {
                    Executor.instance.visualization.focus.clearFocus(this._currentFocus)
                }

                // Focus
                Executor.instance.visualization.focus.focusOn(execution)
                this._currentFocus = execution

                if (this.action.views.length > 0) {
                    this.action.views[this.action.views.length - 1].controller.setEnvironments(
                        [execution.postcondition]
                        // [...writes(execution)].map((x) => x.id)
                    )
                }
            }
        } else {
            // Unfocus
            if (this._currentFocus != null) {
                // Unfocus
                Executor.instance.visualization.focus.clearFocus(this._currentFocus)
                this._currentFocus = null
            }
        }
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        Ticker.instance.removeTickFrom(this._tickerId)
        this.element.remove()
    }
}
