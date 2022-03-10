import { Executor } from '../../executor/Executor'
import { createEl, createPath } from '../../utilities/dom'
import { View } from '../View/View'
import { Timeline } from './Timeline'

/* ------------------------------------------------------ */
/*                    Timeline renderer                   */
/* ------------------------------------------------------ */
export class TimelineRenderer {
    element: HTMLElement
    anchors: HTMLElement[] = []
    connections: { path: SVGPathElement; svg: SVGElement }[] = []

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
        this.views.forEach((view) => view.destroy())

        this.anchors = []
        this.views = []

        // If collapsed (and not showing steps), then it doesn't have any renderers; only the anchor
        if (timeline.state.isCollapsed && !timeline.state.isShowingSteps) {
            this.element.classList.remove('expanded')
            this.element.classList.remove('showing-steps')

            const anchor = this.createAnchor()
            this.anchors.push(anchor)
        }
        // Else not collapsed (and not showing steps), then it has the pre and post renderers
        else if (!timeline.state.isCollapsed && !timeline.state.isShowingSteps) {
            this.element.classList.add('expanded')
            this.element.classList.remove('showing-steps')

            // Create pre-view
            const pre = this.createView()
            pre.renderer.render([timeline.action.execution.precondition])
            this.views.push(pre)

            // Create anchors
            const anchor = this.createAnchor()
            this.anchors.push(anchor)

            // Create post-view
            const post = this.createView()
            // TODO: Add in precondition here
            post.renderer.render([timeline.action.execution.postcondition])
            this.views.push(post)

            // Update connections
            setTimeout(() => {
                this.updateConnections(timeline)
            }, 100)
        }
        // Else not collapsed and showing steps, then it has a renderer (and anchor) for each step and for pre and post conditions
        else if (!timeline.state.isCollapsed && timeline.state.isShowingSteps) {
            this.element.classList.add('expanded')
            this.element.classList.add('showing-steps')

            // Create pre-view
            const pre = this.createView()
            pre.renderer.element.classList.add('start')
            pre.renderer.render([timeline.action.execution.precondition])
            this.views.push(pre)

            // Start anchor
            const startAnchor = this.createAnchor()
            startAnchor.classList.add('start')
            this.anchors.push(startAnchor)

            // Renderer for each step
            for (const step of timeline.steps) {
                // Add step to timeline
                this.element.appendChild(step.renderer.element)

                // Add corresponding view to timeline
                const view = this.createView()
                view.renderer.render([step.execution.postcondition])
                this.views.push(view)
            }

            // Create post-view
            const post = this.createView()
            post.renderer.element.classList.add('end')
            post.renderer.render([timeline.action.execution.postcondition])
            this.views.push(post)

            // End anchor
            const endAnchor = this.createAnchor()
            endAnchor.classList.add('end')
            this.anchors.push(endAnchor)

            setTimeout(() => {
                this.updateConnections(timeline)
            }, 100)
        } else if (timeline.state.isCollapsed && timeline.state.isShowingSteps) {
            this.element.classList.remove('expanded')
            this.element.classList.add('showing-steps')

            // Start anchor
            const startAnchor = this.createAnchor()
            startAnchor.classList.add('start')
            this.anchors.push(startAnchor)

            // Renderer for each step
            for (const step of timeline.steps) {
                // Add step to timeline
                this.element.appendChild(step.renderer.element)

                // Add corresponding view to timeline
                const view = this.createView()
                view.renderer.render([step.execution.postcondition])
                this.views.push(view)
            }

            // End anchor
            const endAnchor = this.createAnchor()
            endAnchor.classList.add('end')
            this.anchors.push(endAnchor)
        }

        // Connections
        this.anchors[0].addEventListener('click', () => {
            const action = timeline.action
            if (!action.timeline.state.isShowingSteps) {
                action.timeline.controller.showSteps()
            } else {
                action.timeline.controller.hideSteps()
            }
            action.renderer.render(action)
        })

        Executor.instance.visualization.updateAllConnections()

        setTimeout(() => {
            Executor.instance.visualization.updateAllConnections()
        }, 100)
    }

    updateConnections(timeline: Timeline) {
        // return
        const scale = Executor.instance.visualization.camera.panzoom.getScale()

        this.connections.forEach((connection) => connection.svg.remove())
        this.connections = []

        // Start
        if (!timeline.state.isCollapsed) {
            const connection = createPath('timeline-connection', this.element)
            const preBbox = this.views[0].renderer.element.getBoundingClientRect()
            const anchorBbox = this.anchors[0].getBoundingClientRect()

            setSVGPath(
                connection,
                [anchorBbox.x + anchorBbox.width / 2, preBbox.y + preBbox.height],
                [anchorBbox.x + anchorBbox.width / 2, anchorBbox.y + anchorBbox.height / 2]
            )

            this.connections.push(connection)
        }

        // Connection for each step
        if (timeline.state.isShowingSteps) {
            for (let i = 0; i < timeline.steps.length + 1; i++) {
                let a: DOMRect
                let b: DOMRect
                let offset = 'straight'

                if (i == 0) {
                    // continue
                    a = this.anchors[0].getBoundingClientRect()
                    offset = 'curved'
                } else {
                    if (timeline.steps[i - 1].timeline.state.isShowingSteps) {
                        const aAnchors = timeline.steps[i - 1].timeline.renderer.anchors
                        const first =
                            timeline.steps[
                                i - 1
                            ].timeline.renderer.anchors[0].getBoundingClientRect()
                        const last = aAnchors[aAnchors.length - 1].getBoundingClientRect()

                        const cc = createPath(
                            ['timeline-connection', 'timeline-dashed'],
                            this.element
                        )
                        setSVGPath(
                            cc,
                            [first.x + first.width / 2, first.y + first.height / 2],
                            [last.x + last.width / 2, last.y + last.height / 2],
                            'curved'
                        )
                        this.connections.push(cc)

                        a = last
                    } else {
                        a =
                            timeline.steps[
                                i - 1
                            ].timeline.renderer.anchors[0].getBoundingClientRect()
                    }
                }

                if (i == timeline.steps.length) {
                    let endIndex = this.views.length - (timeline.state.isCollapsed ? 1 : 2)
                    if (endIndex <= 0) continue
                    b = this.views[endIndex].renderer.element.getBoundingClientRect()
                    b.x = a.x + a.width / 2
                    b.y = b.y
                    b.width = 0
                    b.height = 0
                } else {
                    b = timeline.steps[i].timeline.renderer.anchors[0].getBoundingClientRect()
                }

                const connection = createPath('timeline-connection', this.element)

                setSVGPath(
                    connection,
                    [a.x + a.width / 2, a.y + a.height / 2],
                    [b.x + b.width / 2, b.y + b.height / 2],
                    offset as any
                )

                this.connections.push(connection)
            }

            // Last between the last view and the anchor
            let endIndex = this.views.length - (timeline.state.isCollapsed ? 1 : 2)
            if (endIndex > 0) {
                const connection = createPath('timeline-connection', this.element)

                const anchorBbox = this.anchors[this.anchors.length - 1].getBoundingClientRect()
                const postBbox = this.views[endIndex].renderer.element.getBoundingClientRect()

                setSVGPath(
                    connection,
                    [postBbox.x + 52, postBbox.y + postBbox.height],
                    [anchorBbox.x + anchorBbox.width / 2, anchorBbox.y + anchorBbox.height / 2]
                )

                this.connections.push(connection)
            }
        }

        // Start -> End
        if (!timeline.state.isCollapsed && timeline.state.isShowingSteps) {
            const connection = createPath(['timeline-connection', 'timeline-dashed'], this.element)
            const preBbox = this.views[0].renderer.element.getBoundingClientRect()
            const postBbox =
                this.views[this.views.length - 1].renderer.element.getBoundingClientRect()

            setSVGPath(
                connection,
                [
                    preBbox.x + (timeline.state.isShowingSteps ? 29 : 35) * scale,
                    preBbox.y + preBbox.height,
                ],
                [postBbox.x + (timeline.state.isShowingSteps ? 29 : 35) * scale, postBbox.y],
                'curved'
            )

            this.connections.push(connection)
        }

        // End
        if (!timeline.state.isCollapsed) {
            const connection = createPath('timeline-connection', this.element)
            const postBbox =
                this.views[this.views.length - 1].renderer.element.getBoundingClientRect()
            const anchorBbox = this.anchors[this.anchors.length - 1].getBoundingClientRect()

            setSVGPath(
                connection,
                [anchorBbox.x + anchorBbox.width / 2, anchorBbox.y + anchorBbox.height / 2],
                [anchorBbox.x + anchorBbox.width / 2, postBbox.y + 4]
            )

            this.connections.push(connection)
        }
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        this.anchors.forEach((anchor) => anchor.remove())
        this.connections.forEach((connection) => connection.svg.remove())
        this.views.forEach((view) => view.destroy())

        this.element.remove()
    }
}

/* ------------------ Helper functions ------------------ */

/**
 *
 * @param connection
 * @param a Canvas space
 * @param b Canvas space
 * @param offset
 */
function setSVGPath(
    connection: { svg: SVGElement; path: SVGPathElement },
    a: [x: number, y: number],
    b: [x: number, y: number],
    type: 'straight' | 'curved' = 'straight'
) {
    const parentBbox = connection.svg.getBoundingClientRect()

    const factor = 1 / Executor.instance.visualization.camera.panzoom.getScale()

    const target = getBoundingBoxOfStartAndEnd(
        a[0] - parentBbox.x,
        a[1] - parentBbox.y,
        b[0] - parentBbox.x,
        b[1] - parentBbox.y
    )
    connection.svg.style.left = `${factor * (target.x - 2.5)}px`
    connection.svg.style.top = `${factor * (target.y - 2.5)}px`

    const bbox = connection.svg.getBoundingClientRect()

    // TODO: Scaling

    // Will be set to start of SVG
    const p1 = [factor * (a[0] - bbox.x), factor * (a[1] - bbox.y)]
    const p2 = [factor * (b[0] - bbox.x), factor * (b[1] - bbox.y)]

    const c1 = [...p1]
    const c2 = [...p2]

    if ('curved') {
        c1[1] += (p2[1] - p1[1]) / 2
        c2[1] -= (p2[1] - p1[1]) / 2
    }

    connection.path.setAttribute(
        'd',
        `M ${p1[0]} ${p1[1]} C ${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]}  ${p2[0]} ${p2[1]}`
    )

    const pathBbox = connection.path.getBoundingClientRect()
    connection.svg.style.width = `${pathBbox.width + 5}px`
    connection.svg.style.height = `${pathBbox.height + 5}px`
}

function getBoundingBoxOfStartAndEnd(
    x1: number,
    y1: number,
    x2: number,
    y2: number
): { x: number; y: number; width: number; height: number } {
    const x = Math.min(x1, x2)
    const y = Math.min(y1, y2)
    const width = Math.abs(x2 - x1)
    const height = Math.abs(y2 - y1)

    return { x, y, width, height }
}
