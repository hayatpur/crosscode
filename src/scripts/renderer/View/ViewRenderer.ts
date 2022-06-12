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

    // SVG overlay
    svg: SVGElement

    // Stack container
    renderer: EnvironmentRenderer
    // preRenderer: EnvironmentRenderer
    // renderedFrames: EnvironmentRenderer[] = []

    /* ----------------------- Create ----------------------- */
    constructor(view: View) {
        this.view = view

        this.create()
    }

    create() {
        this.element = createEl('div', 'view', document.body)
        const margin = Editor.instance.getMaxWidth() + 200
        this.element.style.left = `${margin}px`

        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        this.element.appendChild(this.svg)
        this.svg.classList.add('environment-svg')
    }

    createEnvironmentRenderer() {
        const renderer = new EnvironmentRenderer()
        return renderer
    }

    /* --------------------- Update time -------------------- */
    update() {
        const mapping = Executor.instance.visualization.mapping
        const time = mapping.time

        let candidate = 0
        let amount = 0

        /* --------------- Find the closest frame --------------- */
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

        /* ------------------- Assign classes ------------------- */
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

        /* --------------- Show the current frame --------------- */

        /* -------------------- Apply breaks -------------------- */

        /* -------------------- Apply trails -------------------- */
        this.renderer.render(this.view.state.frames[candidate])

        for (let i = 0; i < this.view.trails.length; i++) {
            const trails = this.view.trails[i]
            if (i < candidate) {
                trails.updateTime(1, this.renderer)
            } else if (i > candidate) {
                // trails.updateTime(0, this.renderer)
            } else {
                trails.updateTime(amount, this.renderer)
            }
        }

        for (let i = 0; i < this.view.trails.length; i++) {
            const trails = this.view.trails[i]
            if (i < candidate) {
                trails.postUpdate(1, this.renderer)
            } else if (i > candidate) {
                // trails.updateTime(0, this.renderer)
            } else {
                trails.postUpdate(amount, this.renderer)
            }
        }
    }

    updateTime() {
        this.update()
    }

    /**
     * Sync the frames with the state.
     * TODO: Currently destroys and re-instantiates - can be incremental.
     */
    syncFrames() {
        /* ------------------ Destroy existing ------------------ */
        this.renderer?.destroy()

        /* --------------------- Create new --------------------- */
        this.renderer = this.createEnvironmentRenderer()
        this.element.appendChild(this.renderer.element)
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        this.renderer.destroy()
        this.renderer = null

        this.element.remove()
        this.element = null
    }
}
