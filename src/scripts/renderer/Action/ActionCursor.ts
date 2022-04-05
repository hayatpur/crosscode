import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
import { Executor } from '../../executor/Executor'
import { createEl } from '../../utilities/dom'
import { Ticker } from '../../utilities/Ticker'
import { Action } from './Action'

export class ActionCursor {
    element: HTMLElement
    action: Action

    active: boolean = false

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
                if (this.action.time > 0) {
                    this.action.time -= 1
                }
            } else if (e.key == 'ArrowDown') {
                const allSteps = this.action.getAllFrames()
                if (this.action.time < allSteps.length - 1) {
                    this.action.time += 1
                }
            }
        })

        this._tickerId = Ticker.instance.registerTick(this.tick.bind(this))
    }

    create() {
        this.element = createEl('div', 'action-cursor', this.action.renderer.element)
    }

    /* ----------------------- Update ----------------------- */
    tick(dt: number) {
        if (this.active) {
            const allSteps = this.action.getAllFrames()

            // Move to current position
            const step = allSteps[this.action.time]
            let stepBbox = step.renderer.element.getBoundingClientRect()
            let parentBbox = this.action.renderer.element.getBoundingClientRect()
            if (stepBbox.y == 0) {
                const overlaps = [...Executor.instance.visualization.focus.actions].filter(
                    (action) =>
                        JSON.stringify(action.execution.nodeData.location) ==
                        JSON.stringify(step.execution.nodeData.location)
                )

                for (const stepOverlap of overlaps) {
                    stepBbox = stepOverlap.renderer.headerLabel.getBoundingClientRect()

                    if (stepBbox.y != 0) {
                        break
                    }
                }
            }

            this.element.style.top = `${stepBbox.y - parentBbox.y + 10}px`

            let execution = step.execution

            // Focus
            if (this._currentFocus != execution) {
                // Unfocus
                if (this._currentFocus != null) {
                    Executor.instance.visualization.focus.clearFocus(this._currentFocus)
                }

                // Focus
                Executor.instance.visualization.focus.focusOn(execution)
                this._currentFocus = execution
            }

            this.action.views.forEach((view) => {
                view.renderer.updateTime(view)
            })
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
