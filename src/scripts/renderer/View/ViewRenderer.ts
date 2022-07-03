import { Howl } from 'howler'
import { Executor } from '../../executor/Executor'
import { getLeafSteps } from '../../utilities/action'
import { createElement, createSVGElement } from '../../utilities/dom'
import { remap } from '../../utilities/math'
import { getBreakIndexOfFrameIndex, getProxyOfAction } from '../Action/Mapping/ActionMapping'
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
    renderers: EnvironmentRenderer[] = []
    containers: HTMLElement[] = []

    forwards: Howl

    /* ----------------------- Create ----------------------- */
    constructor(view: View) {
        this.view = view

        this.element = createElement('div', 'view', Executor.instance.visualization.container)
        this.svg = createSVGElement('environment-svg', this.element)

        this.forwards = new Howl({
            src: ['./src/assets/material_product_sounds/ogg/04 Secondary System Sounds/navigation_transition-left.ogg'],
        })
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
            const proxy = getProxyOfAction(steps[i])
            const start = proxy.timeOffset
            const end = start + proxy.element.getBoundingClientRect().height // TODO: Fix end point calculation
            candidate = i

            if (time >= start) {
                amount = Math.min(remap(time, start, end, 0, 1), 1)
                if (time <= end) {
                    if (!proxy.element.classList.contains('is-playing')) {
                        // if (proxy.element.classList.contains('has-played')) {
                        //     this.backwards.play()
                        // } else {
                        this.forwards.rate(Math.max(0.5, 3 - Math.abs(start - end) / 20))
                        this.forwards.play()
                        // }
                    }

                    proxy.action.renderer.element.classList.add('is-playing')
                    proxy.element.classList.add('is-playing')
                }
                break
            }
        }

        /* ------------------- Assign classes ------------------- */
        for (let i = 0; i < steps.length; i++) {
            const proxy = getProxyOfAction(steps[i])
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
        const candidateBreakIndex = getBreakIndexOfFrameIndex(mapping, candidate)
        this.renderers[candidateBreakIndex].render(this.view.state.frames[candidate])

        for (let i = 0; i < this.view.trails.length; i++) {
            const breakIndex = getBreakIndexOfFrameIndex(mapping, i)
            const trails = this.view.trails[i]
            if (i < candidate) {
                trails.updateTime(1, this.renderers[breakIndex])
            } else if (i > candidate) {
                // trails.updateTime(0, this.renderer)
            } else {
                trails.updateTime(amount, this.renderers[breakIndex])
            }
        }

        for (let i = 0; i < this.view.trails.length; i++) {
            const breakIndex = getBreakIndexOfFrameIndex(mapping, i)
            const trails = this.view.trails[i]
            if (i < candidate) {
                trails.postUpdate(1, this.renderers[breakIndex])
            } else if (i > candidate) {
                trails.postUpdate(0, this.renderers[breakIndex])
            } else {
                trails.postUpdate(amount, this.renderers[breakIndex])
            }
        }

        for (let i = 0; i < this.view.trails.length; i++) {
            const trails = this.view.trails[i]
            const breakIndex = getBreakIndexOfFrameIndex(mapping, i)

            trails.trails.forEach((trail) => trail.renderer.alwaysUpdate(this.renderers[breakIndex]))
        }

        /* ----------- Update position of containers ------------ */
        for (let i = 0; i < this.containers.length; i++) {
            const container = this.containers[i]
            // const breakIndex = mapping.breaks[i] ?? steps.length - 1
            // const prevBreakIndex = mapping.breaks[i - 1] ?? 0

            // If candidate is in the same break
            if (candidateBreakIndex == i) {
                const activeAction = getProxyOfAction(steps[0])
                // const activeAction = mapping.getProxyOfAction(steps[candidate])
                const activeActionBbox = activeAction.element.getBoundingClientRect()
                container.style.top = `${
                    activeActionBbox.top + activeActionBbox.height / 2 - container.getBoundingClientRect().height / 2
                }px`

                container.classList.remove('will-play')
                container.classList.remove('has-played')
            } else if (candidateBreakIndex < i) {
                container.classList.add('will-play')
                container.classList.remove('has-played')
            } else {
                container.classList.add('has-played')
                container.classList.remove('will-play')
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
        this.renderers.forEach((renderer) => renderer?.destroy())
        this.renderers = []

        this.containers.forEach((container) => container.remove())
        this.containers = []

        /* --------------------- Create new --------------------- */
        const mapping = Executor.instance.visualization.mapping

        // Create containers
        for (let i = 0; i < mapping.breaks.length + 1; i++) {
            const container = createElement('div', 'environment-container')
            this.containers.push(container)
            this.element.appendChild(container)
        }

        // Create renderers
        for (let i = 0; i < mapping.breaks.length + 1; i++) {
            const renderer = this.createEnvironmentRenderer()
            this.renderers.push(renderer)

            const container = this.containers[i]
            container.appendChild(renderer.element)
        }

        /* ----------- Place breaks at right position ----------- */
        const steps = getLeafSteps(Executor.instance.visualization.program.steps)
        for (let i = 0; i < mapping.breaks.length; i++) {
            const actionToBreakOn = steps[0]
            const actionToBreakOnBbox = actionToBreakOn.renderer.element.getBoundingClientRect()

            const nextAction = steps[mapping.breaks[i] + 1]
            const nextActionBbox = nextAction?.renderer.element.getBoundingClientRect()

            if (nextActionBbox != null) {
                mapping.breakElements[i].style.top = `${(actionToBreakOnBbox.bottom + nextActionBbox.top) / 2}px`
            } else {
                mapping.breakElements[i].style.top = `${actionToBreakOnBbox.bottom + 20}px`
            }
        }
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        this.renderers.forEach((renderer) => renderer.destroy())
        this.element.remove()
    }
}
