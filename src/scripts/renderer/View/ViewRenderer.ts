import { createEl } from '../../utilities/dom'
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

    /* ----------------------- Create ----------------------- */
    constructor() {
        this.create()
    }

    create() {
        this.element = createEl('div', 'view')
    }

    createEnvironmentRenderer() {
        const renderer = new EnvironmentRenderer()
        this.element.appendChild(renderer.element)
        return renderer
    }

    /* ----------------------- Render ----------------------- */
    render(view: View, filter?: string[]) {
        this.renderEnvironment(view, filter)

        console.log(this.environmentRenderers)

        setTimeout(() => {
            this.renderTrails(view)
            this.updateTime(view)
        }, 100)
    }

    renderEnvironment(view: View, filter?: string[]) {
        const time = view.state.time

        // Render environments
        if (view.executions.length > 0) {
            if (this.environmentRenderers.length == 0) {
                this.environmentRenderers[0] = this.createEnvironmentRenderer()
            }
            this.environmentRenderers[0].render(view.executions[0].precondition, filter)
            this.environmentRenderers[0].element.classList.add('hidden')
        }

        for (let i = 0; i < view.executions.length; i++) {
            if (this.environmentRenderers.length - 1 <= i) {
                this.environmentRenderers.push(this.createEnvironmentRenderer())
            }

            this.environmentRenderers[i + 1].render(view.executions[i].postcondition, filter)
            this.environmentRenderers[i + 1].element.classList.add('hidden')
        }

        let hit = false
        for (let i = 0; i < view.executions.length; i++) {
            const execTime = view.controller.getTime(i)

            if (execTime >= time) {
                this.environmentRenderers[i + 1].element.classList.remove('hidden')
                hit = true
                break
            }
        }

        if (!hit && this.environmentRenderers.length > 0) {
            this.environmentRenderers[
                this.environmentRenderers.length - 1
            ].element.classList.remove('hidden')
        }

        // Cleanup unused renderers
        while (this.environmentRenderers.length - 1 > view.executions.length) {
            const renderer = this.environmentRenderers.pop()
            renderer.destroy()
        }
    }

    renderTrails(view: View) {
        Object.values(this.trails).forEach((trail) => trail.destroy())
        this.trails = {}

        const hits = new Set<string>()
        for (let i = 0; i < view.executions.length; i++) {
            const exec = view.executions[i]
            let trail = this.trails[exec.id]

            if (!trail) {
                this.trails[exec.id] = new TrailGroup(
                    exec,
                    this.environmentRenderers[i],
                    this.environmentRenderers[i + 1]
                )
                trail = this.trails[exec.id]
            }

            trail.render()

            hits.add(exec.id)

            // this.trails[exec.id].update(
            //     exec,
            //     this.environmentRenderers[i],
            //     this.environmentRenderers[i + 1]
            // )
        }

        // for (const id of Object.keys(this.trails)) {
        //     if (!hits.has(id)) {
        //         this.trails[id].destroy()
        //         delete this.trails[id]
        //     }
        // }
    }

    updateTime(view: View) {
        const factor = 1 / (view.executions.length + 1)

        // Update view being shown
        this.environmentRenderers.forEach((renderer) => {
            renderer.element.classList.add('hidden')
        })
        let hit = false
        for (let i = 0; i < view.executions.length; i++) {
            const execTime = view.controller.getTime(i)

            if (execTime >= view.state.time) {
                this.environmentRenderers[i + 1].element.classList.remove('hidden')
                hit = true
                break
            }
        }

        if (!hit && this.environmentRenderers.length > 0) {
            this.environmentRenderers[
                this.environmentRenderers.length - 1
            ].element.classList.remove('hidden')
        }

        // Update trail time
        for (let i = 0; i < view.executions.length; i++) {
            const id = view.executions[i].id
            const trails = view.renderer.trails[id]
            trails.updateTime(Math.min(Math.max(view.state.time / factor - i, 0), 1))
        }
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        for (const renderer of this.environmentRenderers) {
            renderer.destroy()
        }
        this.environmentRenderers = []

        this.element.remove()
        this.element = null
    }
}
