import { Editor } from '../../editor/Editor'
import { Executor } from '../../executor/Executor'
import { getLeafSteps } from '../../utilities/action'
import { createEl } from '../../utilities/dom'
import { remap } from '../../utilities/math'
import { EnvironmentRenderer } from './Environment/EnvironmentRenderer'
import { View } from './View'

/* ------------------------------------------------------ */
/*                      View Renderer                     */
/* ------------------------------------------------------ */
export class ViewRenderer {
    // Overall container
    element: HTMLElement

    // Corresponding View
    view: View

    // Stack container
    stackContainer: HTMLElement
    stackElements: HTMLElement[] = []

    preRenderer: EnvironmentRenderer
    renderedFrames: EnvironmentRenderer[] = []

    /* ----------------------- Create ----------------------- */
    constructor(view: View) {
        this.view = view

        this.create()
        this.createStack()
    }

    create() {
        this.element = createEl('div', 'view', document.body)

        this.stackContainer = createEl('div', 'view-stack-container', this.element)
        const margin = Editor.instance.getMaxWidth() + 200
        this.element.style.left = `${margin}px`

        this.preRenderer = this.createEnvironmentRenderer()
    }

    createStack() {
        const stack = createEl('div', 'view-stack', this.stackContainer)
        this.stackElements.push(stack)
    }

    createEnvironmentRenderer() {
        const renderer = new EnvironmentRenderer()
        renderer.element.classList.add('is-hidden')
        return renderer
    }

    /* --------------------- Update time -------------------- */
    update() {
        const mapping = Executor.instance.visualization.mapping
        const time = mapping.time

        let candidate = 0
        let amount = 0

        // Find the closest frame
        const steps = getLeafSteps(Executor.instance.visualization.program.steps)

        for (let i = steps.length - 1; i >= 0; i--) {
            const proxy = mapping.getProxyOfAction(steps[i])
            const start = proxy.timeOffset
            const end = start + proxy.element.getBoundingClientRect().height
            candidate = i
            if (time >= start) {
                amount = Math.min(remap(time, start, end, 0, 1), 1)
                if (time <= end) {
                    proxy.action.renderer.element.classList.add('is-playing')
                    proxy.element.classList.add('is-playing')
                }
                break
            }
        }

        for (let i = 0; i < steps.length; i++) {
            const proxy = mapping.getProxyOfAction(steps[i])
            if (i != candidate) {
                proxy.action.renderer.element.classList.remove('is-playing')
                proxy.element.classList.remove('is-playing')
            }
            if (i < candidate) {
                proxy.action.renderer.element.classList.add('has-played')
                proxy.element.classList.add('has-played')
            } else {
                proxy.action.renderer.element.classList.remove('has-played')
                proxy.element.classList.remove('has-played')
            }
        }

        if (candidate == -1) {
            console.warn('No candidate frame found.')
            return
        }

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
            if (this.renderedFrames[i].element.parentElement != this.stackElements[currStack]) {
                this.stackElements[currStack].appendChild(this.renderedFrames[i].element)
            }

            if (mapping.breaks.includes(i)) {
                currStack++
                if (currStack >= this.stackElements.length) {
                    this.createStack()
                }
            }
        }

        // let currIndex = 0
        // for (let i = 0; i < this.stacks.length; i++) {
        //     // Relevant stack
        //     const stack = this.stacks[i]
        //     const nextBreak = mapping.breaks[i]
        //     if (candidate > currIndex && nextBreak != null && candidate >= nextBreak) {
        //         stack.classList.add('is-before')
        //         stack.classList.remove('is-after')
        //         stack.classList.remove('is-current')
        //     } else if ((nextBreak == null && candidate >= currIndex) || candidate <= nextBreak) {
        //         stack.classList.add('is-current')
        //         stack.classList.remove('is-before')
        //         stack.classList.remove('is-after')
        //     } else {
        //         stack.classList.add('is-after')
        //         stack.classList.remove('is-before')
        //         stack.classList.remove('is-current')
        //     }
        //     currIndex = nextBreak + 1
        // }
        // // Remove extra stacks
        // while (this.stacks.length - 1 > currStack) {
        //     const last = this.stacks.pop()
        //     last.remove()
        // }
        // // Apply trails to frames
        // // for (const [actionId, trails] of Object.entries(this.view.trails)) {
        // //     if (trails != null) {
        // //         trails.updateTime(amount)
        // //     }
        // // }
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
        // // this.view.dirty = false
    }

    /* -------------------- Update frames ------------------- */
    syncFrames() {
        /* ------------------ Destroy existing ------------------ */
        this.preRenderer.destroy()
        this.preRenderer = this.createEnvironmentRenderer()

        for (const renderer of this.renderedFrames) {
            renderer.destroy()
        }
        this.renderedFrames = []

        /* --------------------- Create new --------------------- */
        if (this.view.state.preFrame != null) {
            this.preRenderer.render(this.view.state.preFrame)
        }

        for (let i = 0; i < this.view.state.frames.length; i++) {
            this.renderedFrames.push(this.createEnvironmentRenderer())
            this.renderedFrames[i].render(this.view.state.frames[i])
        }
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        this.preRenderer.destroy()

        for (const renderer of this.renderedFrames) {
            renderer.destroy()
        }
        this.renderedFrames = []

        this.stackElements.forEach((stack) => stack.remove())
        this.stackElements = []

        this.stackContainer.remove()
        this.stackContainer = null

        this.element.remove()
        this.element = null
    }
}
