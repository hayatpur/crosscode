import { ExecutionGraph } from '../../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../../execution/primitive/ExecutionNode'
import { createEl } from '../../../utilities/dom'
import { lerp } from '../../../utilities/math'
import { Ticker } from '../../../utilities/Ticker'
import { ActionMapping } from './ActionMapping'
import { getLeafSteps } from './ControlFlow'

export class ActionMappingCursor {
    element: HTMLElement
    mapping: ActionMapping

    private _tickerId: string
    _currentFocus: ExecutionGraph | ExecutionNode

    // Flag for if it needs to re-render
    dirty: boolean = true

    dragging: boolean = false
    private prevMouse: { x: number; y: number }
    targetTime: number = 0

    /* ----------------------- Create ----------------------- */
    constructor(mapping: ActionMapping) {
        this.mapping = mapping

        this.create()

        this.element.addEventListener('mousedown', (e) => {
            this.dragging = true
            this.prevMouse = { x: e.x, y: e.y }

            this.targetTime = this.mapping.time

            this.element.classList.add('is-dragging')
        })

        document.addEventListener('mousemove', (e) => {
            if (this.dragging) {
                const yDelta = e.y - this.prevMouse.y

                this.targetTime += yDelta

                // Clamp time
                if (this.targetTime < 0) {
                    this.targetTime = 0
                }

                this.targetTime = Math.min(
                    this.targetTime,
                    this.mapping.controlFlow.flowPath.getTotalLength() + 6
                )

                this.prevMouse = { x: e.x, y: e.y }
                e.stopPropagation()
                e.preventDefault()
            }
        })

        document.addEventListener('mouseup', (e) => {
            if (this.dragging) {
                this.dragging = false
                e.stopPropagation()
                e.preventDefault()

                this.element.classList.remove('is-dragging')
            }
        })

        /* --- Arrow up and down used to go through the steps --- */
        document.addEventListener('keydown', (e) => {
            // if (e.key == 'ArrowUp') {
            //     if (this.action.time > 0) {
            //         this.action.time -= 1
            //     }
            // } else if (e.key == 'ArrowDown') {
            //     const allSteps = this.action.getAllFrames()
            //     if (this.action.time < allSteps.length - 1) {
            //         this.action.time += 1
            //     }
            // }
        })

        this._tickerId = Ticker.instance.registerTick(this.tick.bind(this))
    }

    create() {
        this.element = createEl('div', 'action-cursor', this.mapping.element)
    }

    /* ----------------------- Update ----------------------- */
    tick(dt: number) {
        // console.log('T:', this.mapping.time)
        // Move time along control flow path
        const controlFlow = this.mapping.controlFlow
        const { x, y } = controlFlow.flowPath.getPointAtLength(this.mapping.time)
        this.element.style.left = `${x - 5}px`
        this.element.style.top = `${y - 5}px`

        // If not grabbing, then gravitate towards next action
        const view = this.mapping.action.view

        if (!this.dragging) {
            const time = this.mapping.time

            let candidate = 0
            let amount = 0
            let nextOffset = 0

            // Find the closest frame
            const steps = getLeafSteps(view.action.steps)
            for (let i = steps.length - 1; i >= 0; i--) {
                const proxy = steps[i].proxy

                const start = proxy.timeOffset
                const end = start + proxy.element.getBoundingClientRect().height

                candidate = i

                if (time >= start) {
                    nextOffset = end
                    amount = end - start
                    break
                }
            }

            if (candidate == -1) {
                return
            }

            if (amount > 0) {
                this.mapping.time = lerp(time, nextOffset, 0.1)
                // this.mapping.time = Math.min(this.mapping.time, nextOffset - 0.01)
            }
        } else {
            this.mapping.time = lerp(this.mapping.time, this.targetTime, 0.1)
        }
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        Ticker.instance.removeTickFrom(this._tickerId)
        this.element.remove()
    }
}
