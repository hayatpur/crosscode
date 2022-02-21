import { getArrow } from 'curved-arrows'
import { getGlobalTraces, GlobalAnimationTraceChain } from '../../execution/graph/graph'
import { Executor } from '../../executor/Executor'
import { View } from '../View'

export class GlobalTrace {
    parent: View
    connections: SVGPathElement[] = []
    connectionReferences: { first: HTMLElement; second: HTMLElement }[] = []

    globalTrace: GlobalAnimationTraceChain[]

    constructor(parent: View) {
        this.parent = parent
    }

    show() {
        this.globalTrace = getGlobalTraces(this.parent)
        console.log(this.globalTrace)

        // console.log(
        //     this.parent.stepsTimeline.views.map((v) =>
        //         v.renderer.animationRenderer.environmentRenderer.getAllChildRenderers()
        //     )
        // )

        for (const trace of this.globalTrace) {
            let end = trace
            let currentElement = null

            while (end != null) {
                if (end.value.location == null) {
                    end = end.children[0][1]
                    continue
                }

                const view = Executor.instance.rootView.viewLookup[end.value.location.viewId]

                const renderers =
                    view.renderer.animationRenderer.environmentRenderer.getAllChildRenderers()

                // Connection is between the first and second element
                const firstElement = currentElement
                const secondElement = renderers[end.value.id]?.element
                if (secondElement == null) {
                    console.warn('No element found for id', end.value.id, Object.keys(renderers))

                    if (end.children != null && end.children[0] != null) {
                        end = end.children[0][1]
                    } else {
                        end = null
                    }
                    continue
                }

                currentElement = secondElement

                // Start of trace
                if (firstElement == null) {
                    if (end.children != null && end.children[0] != null) {
                        end = end.children[0][1]
                    } else {
                        end = null
                    }
                    continue
                }

                // Create connection
                const connection = document.createElementNS('http://www.w3.org/2000/svg', 'path')
                connection.classList.add('global-trace-connection')
                document.getElementById('svg-canvas').append(connection)
                this.connections.push(connection)

                // Create connection reference
                this.connectionReferences.push({ first: firstElement, second: secondElement })

                if (end.children != null && end.children[0] != null) {
                    end = end.children[0][1]
                } else {
                    end = null
                }
            }
        }
    }

    tick(dt: number) {
        if ((this.globalTrace = null)) return
        for (let i = 0; i < this.connections.length; i++) {
            const connection = this.connections[i]
            const { first, second } = this.connectionReferences[i]
            const firstBbox = first.getBoundingClientRect()
            const secondBbox = second.getBoundingClientRect()

            const [sx, sy, c1x, c1y, c2x, c2y, ex, ey, ae] = getArrow(
                secondBbox.x + secondBbox.width / 2,
                secondBbox.y + secondBbox.height / 2,
                firstBbox.x + firstBbox.width / 2,
                firstBbox.y + firstBbox.height,
                {
                    padEnd: 0,
                    padStart: 0,
                }
            )
            connection.setAttribute(
                'd',
                `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`
            )
        }
    }

    hide() {
        for (const connection of this.connections) {
            connection.remove()
        }

        this.connectionReferences = []
        this.connections = []

        this.globalTrace = null
    }
}
