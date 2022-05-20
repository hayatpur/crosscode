import { createEl } from '../../utilities/dom'
import { remap } from '../../utilities/math'
import { Ticker } from '../../utilities/Ticker'
import { getLeafSteps } from '../Action/Mapping/ControlFlow'
import { EnvironmentRenderer } from './Environment/EnvironmentRenderer'
import { View } from './View'

/* ------------------------------------------------------ */
/*                      View Renderer                     */
/* ------------------------------------------------------ */
export class ViewRenderer {
    // Corresponding View
    view: View

    // Overall container
    element: HTMLElement
    stacks: HTMLElement[] = []

    preRenderer: EnvironmentRenderer
    renderedFrames: EnvironmentRenderer[] = []

    private _tickerId: string

    /* ----------------------- Create ----------------------- */
    constructor(view: View) {
        this.view = view

        this.create()
        this.createStack()
        this._tickerId = Ticker.instance.registerTick(this.tick.bind(this))
    }

    create() {
        this.element = createEl('div', 'view', this.view.action.renderer.element)

        this.preRenderer = this.createEnvironmentRenderer()
    }

    createStack() {
        const stack = createEl('div', 'view-stack', this.element)
        this.stacks.push(stack)
    }

    createEnvironmentRenderer() {
        const renderer = new EnvironmentRenderer()
        renderer.element.classList.add('is-hidden')
        return renderer
    }

    /* --------------------- Update time -------------------- */
    tick(dt: number) {
        const time = this.view.action.mapping.time
        let candidate = 0
        let amount = 0

        // Find the closest frame
        const steps = getLeafSteps(this.view.action.steps)

        for (let i = steps.length - 1; i >= 0; i--) {
            const proxy = steps[i].proxy

            const start = proxy.timeOffset
            const end = start + proxy.indicator.getBoundingClientRect().height
            candidate = i

            if (time >= start) {
                amount = Math.min(remap(time, start, end, 0, 1), 1)
                if (time <= end) {
                    proxy.action.renderer.element.classList.add('is-playing')
                    proxy.indicator.classList.add('is-playing')
                }

                break
            }
        }

        for (let i = 0; i < steps.length; i++) {
            if (i != candidate) {
                steps[i].proxy.action.renderer.element.classList.remove('is-playing')
                steps[i].proxy.indicator.classList.remove('is-playing')
            }
        }

        // console.log(candidate, amount)

        if (candidate == -1) {
            return
        }

        // if (!this.view.dirty) return

        // Show the current frame
        for (let i = 0; i < this.renderedFrames.length; i++) {
            const renderer = this.renderedFrames[i]
            if (i == candidate) {
                renderer.element.classList.remove('is-hidden')
            } else {
                renderer.element.classList.add('is-hidden')
            }
        }

        // Apply breaks
        let currStack = 0

        for (let i = 0; i < steps.length; i++) {
            if (this.renderedFrames[i].element.parentElement != this.stacks[currStack]) {
                this.stacks[currStack].appendChild(this.renderedFrames[i].element)
            }

            if (this.view.action.mapping.breaks.includes(i)) {
                currStack++

                if (currStack >= this.stacks.length) {
                    this.createStack()
                }
            }
        }

        let currIndex = 0
        for (let i = 0; i < this.stacks.length; i++) {
            // Relevant stack
            const stack = this.stacks[i]

            const nextBreak = this.view.action.mapping.breaks[i]

            if (candidate > currIndex && nextBreak != null && candidate >= nextBreak) {
                stack.classList.add('is-before')

                stack.classList.remove('is-after')
                stack.classList.remove('is-current')
            } else if ((nextBreak == null && candidate >= currIndex) || candidate <= nextBreak) {
                stack.classList.add('is-current')

                stack.classList.remove('is-before')
                stack.classList.remove('is-after')
            } else {
                stack.classList.add('is-after')

                stack.classList.remove('is-before')
                stack.classList.remove('is-current')
            }

            currIndex = nextBreak + 1
        }

        // Remove extra stacks
        while (this.stacks.length - 1 > currStack) {
            const last = this.stacks.pop()
            last.remove()
        }

        // Apply trails to frames
        // for (const [actionId, trails] of Object.entries(this.view.trails)) {
        //     if (trails != null) {
        //         trails.updateTime(amount)
        //     }
        // }

        for (let i = 0; i < this.view.trails.length; i++) {
            const trails = this.view.trails[i]

            if (i < candidate) {
                trails.updateTime(1)
            } else if (i > candidate) {
                trails.updateTime(0)
            } else {
                trails.updateTime(amount)
            }
        }

        // this.view.dirty = false
    }

    /* -------------------- Update frames ------------------- */
    syncFrames() {
        if (this.view.state.preFrame != null) {
            this.preRenderer.render(this.view.state.preFrame)
        }

        for (let i = 0; i < this.view.state.frames.length; i++) {
            if (this.renderedFrames.length <= i) {
                this.renderedFrames.push(this.createEnvironmentRenderer())
            }

            this.renderedFrames[i].render(this.view.state.frames[i])
        }

        // Cleanup unused renderers
        while (this.renderedFrames.length - 1 > this.view.state.frames.length) {
            const renderer = this.renderedFrames.pop()
            renderer.destroy()
        }
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        this.preRenderer.destroy()

        for (const renderer of this.renderedFrames) {
            renderer.destroy()
        }
        this.renderedFrames = []
        Ticker.instance.removeTickFrom(this._tickerId)

        this.stacks.forEach((stack) => stack.remove())
        this.stacks = []

        this.element.remove()
        this.element = null
    }
}
