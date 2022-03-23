import { Executor } from '../../executor/Executor'
import { createEl } from '../../utilities/dom'
import { View } from '../View/View'
import { Timeline } from './Timeline'

/* ------------------------------------------------------ */
/*                    Timeline renderer                   */
/* ------------------------------------------------------ */
export class TimelineRenderer {
    element: HTMLElement
    views: View[] = []

    /* ----------------------- Create ----------------------- */
    constructor() {
        this.create()
    }

    create() {
        this.element = createEl('div', 'timeline')
    }

    createAnchor() {
        const anchor = createEl('div', 'timeline-anchor', this.element)
        return anchor
    }

    createView() {
        const view = new View()
        this.element.appendChild(view.renderer.element)
        return view
    }

    /* ----------------------- Render ----------------------- */

    updateClasses(timeline: Timeline) {
        // Root
        timeline.state.isRoot
            ? this.element.classList.add('root')
            : this.element.classList.remove('root')

        // Expanded
        !timeline.state.isCollapsed
            ? this.element.classList.add('expanded')
            : this.element.classList.remove('expanded')

        // Showing steps
        timeline.state.isShowingSteps
            ? this.element.classList.add('showing-steps')
            : this.element.classList.remove('showing-steps')
    }

    render(timeline: Timeline) {
        // Reset
        this.views.forEach((view) => view.destroy())

        this.views = []

        // Update classes
        this.updateClasses(timeline)

        // If not showing steps, then it doesn't have any renderers; only the anchor
        if (!timeline.state.isShowingSteps) {
        }
        // Else not collapsed and showing steps, then it has a renderer (and anchor) for each step and for pre and post conditions
        else {
            // Renderer for each step
            for (const step of timeline.steps) {
                // Add step to timeline
                this.element.appendChild(step.renderer.element)

                // Add corresponding view to timeline
                const view = this.createView()
                view.renderer.render([step.execution.postcondition], timeline.action.execution)
                this.views.push(view)
            }
        }

        // Update connections
        Executor.instance.visualization.updateAllConnections()
        setTimeout(() => {
            Executor.instance.visualization.updateAllConnections()
        }, 100)
    }

    updateConnections(timeline: Timeline) {}

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        // this.anchors.forEach((anchor) => anchor.remove())
        // this.connections.forEach((connection) => connection.svg.remove())
        this.views.forEach((view) => view.destroy())

        this.element.remove()
    }
}

/* ------------------ Helper functions ------------------ */
