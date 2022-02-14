import { getArrow } from 'curved-arrows'
import { LiteralRenderer } from '../../environment/data/literal/LiteralRenderer'
import {
    getAllBranches,
    getAllOperationsAndLeaves,
} from '../../execution/graph/abstraction/Transition'
import { AnimationTraceChain } from '../../execution/graph/graph'
import { View } from '../View'

// A single trace
export class Trace {
    chain: AnimationTraceChain
    view: View

    startElement: HTMLElement
    endElement: HTMLElement

    // Connection
    connection: SVGPathElement
    traceIndicator: HTMLElement
    endArrow: SVGPolygonElement

    operationsContainer: HTMLElement
    operations: HTMLElement[]

    arrowHeadSize = 3

    constructor(view: View, chain: AnimationTraceChain) {
        this.view = view
        this.chain = chain

        this.connection = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        this.connection.classList.add('trace-connection')
        document.getElementById('svg-canvas').append(this.connection)

        this.traceIndicator = document.createElement('div')
        this.traceIndicator.classList.add('trace-indicator')
        document.body.append(this.traceIndicator)

        // this.startCircle = document.createElementNS(
        //     'http://www.w3.org/2000/svg',
        //     'circle'
        // )
        // this.startCircle.classList.add('trace-start-circle')
        // this.startCircle.setAttribute('r', '2')
        // document.getElementById('svg-canvas').append(this.startCircle)

        this.endArrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
        this.endArrow.classList.add('trace-end-arrow')
        this.endArrow.setAttribute(
            'points',
            `0,${-this.arrowHeadSize} ${this.arrowHeadSize * 2},0, 0,${this.arrowHeadSize}`
        )
        document.getElementById('svg-canvas').append(this.endArrow)
    }

    select() {
        this.connection.classList.add('selected')
    }

    deselect() {
        this.connection.classList.remove('selected')
    }

    tick(dt: number) {
        if (this.startElement != null && this.endElement != null) {
            const startBbox = this.startElement.getBoundingClientRect()
            const endBbox = this.endElement.getBoundingClientRect()

            // const points = [
            //     endBbox.x + endBbox.width / 2,
            //     endBbox.y + endBbox.height / 2,

            //     startBbox.x + startBbox.width / 2,
            //     startBbox.y + startBbox.height / 2,
            // ]
            const [sx, sy, c1x, c1y, c2x, c2y, ex, ey, ae] = getArrow(
                startBbox.x + startBbox.width / 2,
                startBbox.y + startBbox.height / 2,
                endBbox.x + endBbox.width / 2,
                endBbox.y + endBbox.height / 2,
                {
                    padEnd: 0,
                    padStart: 0,
                }
            )
            this.connection.setAttribute(
                'd',
                `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`
            )
            // this.endArrow.setAttribute(
            //     'transform',
            //     `translate(${ex}, ${ey}) rotate(${ae})`
            // )

            // this.connection.setAttribute(
            //     'd',
            //     catmullRomSolve(points, Executor.instance.PARAMS.a * 10)
            // )

            // this.traceIndicator.style.left = `${points[0]}px`
            // this.traceIndicator.style.top = `${points[1]}px`
        } else {
            this.connection.setAttribute('d', '')
            this.traceIndicator.style.opacity = '0'
        }
    }

    show() {
        const animationRenderer = this.view.renderer.animationRenderer
        if (animationRenderer == null) {
            return
        }

        // Pre-environment data
        const preEnvironmentRenderers =
            animationRenderer.preEnvironmentRenderer.getAllChildRenderers()
        for (const id of Object.keys(preEnvironmentRenderers)) {
            if (!(preEnvironmentRenderers[id] instanceof LiteralRenderer)) {
                delete preEnvironmentRenderers[id]
            }
        }

        // Environment data
        const environmentRenderers = animationRenderer.environmentRenderer.getAllChildRenderers()
        for (const id of Object.keys(environmentRenderers)) {
            if (!(environmentRenderers[id] instanceof LiteralRenderer)) {
                delete environmentRenderers[id]
            }
        }

        const [operations, leaves] = getAllOperationsAndLeaves(this.chain)

        // Set end element
        const end = this.chain.value
        if (!(end.id in environmentRenderers)) {
            return
        }
        this.endElement = environmentRenderers[end.id].element

        // Set start element
        if (operations.length == 0) {
            // No operations, meaning just preserve the data from previous
            if (preEnvironmentRenderers[end.id] != null) {
                this.startElement = preEnvironmentRenderers[end.id].element
            }
        } else {
            const branches = getAllBranches(this.chain)

            if (branches.length == 1) {
                const branch = branches[0]
                const start = leaves[0].value

                if (start != null) {
                    this.startElement = preEnvironmentRenderers[start.id].element
                } else {
                    this.startElement = null
                }
            } else {
                console.warn("Can't handle multiple branches")
            }
        }
    }

    hide() {
        this.startElement = null
        this.endElement = null
    }

    destroy() {
        this.connection.remove()
        this.traceIndicator.remove()
        this.endArrow.remove()
    }
}
