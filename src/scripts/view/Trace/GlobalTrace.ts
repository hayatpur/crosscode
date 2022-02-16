import { getArrow } from 'curved-arrows'
import { getGlobalTrace, GlobalAnimationTraceChain } from '../../execution/graph/graph'
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
        this.globalTrace = getGlobalTrace(this.parent)
        console.log(this.globalTrace)

        for (const trace of this.globalTrace) {
            let end = trace
            let currentElement = null

            while (end.children.length > 0) {
                if (end.value.location == null) {
                    end = end.children[0][1]
                    continue
                }

                console.log(end.value.location.viewId)
                const view = Executor.instance.rootView.viewLookup[end.value.location.viewId]

                const renderers =
                    view.renderer.animationRenderer.environmentRenderer.getAllChildRenderers()

                // Connection is between the first and second element
                const firstElement = currentElement
                const secondElement = renderers[end.value.id].element
                if (secondElement == null) {
                    end = end.children[0][1]
                    console.warn('No element found for id', end.value.id)
                    continue
                }

                // Start of trace
                if (firstElement == null) {
                    currentElement = secondElement
                    end = end.children[0][1]
                    continue
                }

                // Create connection
                const connection = document.createElementNS('http://www.w3.org/2000/svg', 'path')
                connection.classList.add('global-trace-connection')
                document.getElementById('svg-canvas').append(connection)
                this.connections.push(connection)

                // Create connection reference
                this.connectionReferences.push({ first: firstElement, second: secondElement })

                end = end.children[0][1]
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
                firstBbox.x + firstBbox.width / 2,
                firstBbox.y + firstBbox.height / 2,
                secondBbox.x + secondBbox.width / 2,
                secondBbox.y + secondBbox.height / 2,
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
