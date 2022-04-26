import { createEl } from '../../utilities/dom'
import { lerp } from '../../utilities/math'
import { Ticker } from '../../utilities/Ticker'
import { TrailGroup } from '../Trail/TrailGroup'
import { EnvironmentRenderer } from './Environment/EnvironmentRenderer'
import { View } from './View'

/* ------------------------------------------------------ */
/*                      View Renderer                     */
/* ------------------------------------------------------ */
export class ViewRenderer {
    // Container
    element: HTMLElement

    // Stack of environment renderers
    environmentRenderers: EnvironmentRenderer[] = []

    trails: { [id: string]: TrailGroup } = {}
    time: number = 0
    targetTime: number = 0

    _tickerId: string

    /* ----------------------- Create ----------------------- */
    constructor() {
        this.create()
        this._tickerId = Ticker.instance.registerTick(this.tick.bind(this))
    }

    create() {
        this.element = createEl('div', 'view')
    }

    tick(dt: number) {
        this.time = lerp(this.time, this.targetTime, dt * 0.002)
    }

    createEnvironmentRenderer() {
        const renderer = new EnvironmentRenderer()
        this.element.appendChild(renderer.element)
        renderer.element.classList.add('hidden')
        return renderer
    }

    /* ----------------------- Render ----------------------- */
    render(view: View, filter: string[] = null) {
        this.renderEnvironment(view, filter)

        setTimeout(() => {
            this.renderTrails(view)
            this.updateTime(view)
        }, 100)
    }

    renderEnvironment(view: View, filter: string[] = null) {
        for (let i = 0; i < view.frames.length; i++) {
            if (this.environmentRenderers.length <= i) {
                this.environmentRenderers.push(this.createEnvironmentRenderer())
            }

            this.environmentRenderers[i].render(view.frames[i], filter)
        }

        // Cleanup unused renderers
        while (this.environmentRenderers.length - 1 > view.frames.length) {
            const renderer = this.environmentRenderers.pop()
            renderer.destroy()
        }
    }

    renderTrails(view: View) {
        Object.values(this.trails).forEach((trail) => trail.destroy())
        this.trails = {}
        const hits = new Set<string>()

        const steps = view.action.getAllFrames()

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i]
            let trail = this.trails[step.execution.id]

            if (!trail) {
                this.trails[step.execution.id] = new TrailGroup(
                    step.execution,
                    this.environmentRenderers[i],
                    this.environmentRenderers[i + 1]
                )
                trail = this.trails[step.execution.id]
            }

            trail.render()
            hits.add(step.execution.id)
        }
    }

    updateTime(view: View) {
        this.targetTime = view.action.time
        // const factor = 1 / (view.frames.length + 1)

        // Update view being shown
        this.environmentRenderers.forEach((renderer) => {
            renderer.element.classList.add('hidden')
        })

        for (let i = 0; i < view.frames.length - 1; i++) {
            if (i >= view.action.time) {
                this.environmentRenderers[i + 1].element.classList.remove('hidden')
                break
            }
        }

        // Update trail time
        // const steps = view.action.getAllFrames()
        // const factor = 1 / (steps.length - 1)

        // for (let i = 0; i < steps.length; i++) {
        //     const step = steps[i]
        //     const trails = view.renderer.trails[step.execution.id]
        //     if (trails != null) {
        //         trails.updateTime(Math.min(Math.max(this.time / factor - i, 0), 1))
        //     }
        // }
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        for (const renderer of this.environmentRenderers) {
            renderer.destroy()
        }
        this.environmentRenderers = []
        Ticker.instance.removeTickFrom(this._tickerId)

        this.element.remove()
        this.element = null
    }
}
