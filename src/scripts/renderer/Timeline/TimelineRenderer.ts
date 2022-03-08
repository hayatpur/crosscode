import { createEl } from '../../utilities/dom'
import { View } from '../View/View'
import { Timeline } from './Timeline'

/* ------------------------------------------------------ */
/*                    Timeline renderer                   */
/* ------------------------------------------------------ */
export class TimelineRenderer {
    element: HTMLElement
    anchors: HTMLElement[] = []
    connections: SVGElement[] = []

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
    render(timeline: Timeline) {
        // Reset
        this.anchors.forEach((anchor) => anchor.remove())
        this.connections.forEach((connection) => connection.remove())
        this.views.forEach((view) => view.destroy())

        // If collapsed, then it doesn't have any renderers; only the anchor
        if (timeline.state.isCollapsed) {
            this.element.classList.add('collapsed')

            const anchor = this.createAnchor()
            this.anchors.push(anchor)

            // TODO: Attach action to anchor
        } else {
            this.element.classList.remove('collapsed')

            // Create pre-view
            const pre = this.createView()
            pre.renderer.render([timeline.action.execution.precondition])
            this.views.push(pre)

            // Create anchors
            const anchor = this.createAnchor()
            this.anchors.push(anchor)

            // TODO: Attach action to anchor

            // Create post-view
            const post = this.createView()
            // TODO: Add in precondition here
            post.renderer.render([timeline.action.execution.postcondition])
            this.views.push(post)
        }

        // Connections
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        this.anchors.forEach((anchor) => anchor.remove())
        this.connections.forEach((connection) => connection.remove())
        this.views.forEach((view) => view.destroy())

        this.element.remove()
    }
}
