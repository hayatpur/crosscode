import { getArrow } from 'curved-arrows'
import {
    AnimationTraceOperator,
    getGlobalTraces,
    GlobalAnimationTraceChain,
    queryExecutionGraph,
} from '../../execution/graph/graph'
import { Executor } from '../../executor/Executor'
import { View } from '../Action/Action'
import { TraceOperator } from './TraceOperator'

export class GlobalTrace {
    parent: View
    connections: SVGPathElement[] = []
    connectionReferences: { first: HTMLElement; second: HTMLElement }[] = []

    globalTrace: GlobalAnimationTraceChain[]
    operations: { [connectionIndex: number]: TraceOperator[] } = {}

    constructor(parent: View) {
        this.parent = parent
    }

    show() {
        this.globalTrace = getGlobalTraces(this.parent)

        // console.log(
        //     this.parent.stepsTimeline.views.map((v) =>
        //         v.renderer.animationRenderer.environmentRenderer.getAllChildRenderers()
        //     )
        // )

        // Render trace
        for (const trace of this.globalTrace) {
            let end = trace
            let currentElement = null

            let operation: AnimationTraceOperator = null
            let operationStack: AnimationTraceOperator[] = []

            const hits: Set<string> = new Set()

            // const connections: { first: HTMLElement; second: HTMLElement }[] = []
            while (end != null) {
                // Catches first element having null location
                if (end.value.location == null) {
                    operation = end.children[0][0]
                    end = end.children[0][1]
                    continue
                }

                // Catches operations that aren't in the views
                if (end.value.location.viewId == null) {
                    if (end.children != null && end.children[0] != null) {
                        operationStack.push(operation)
                        operation = end.children[0][0]
                        end = end.children[0][1]
                    } else {
                        end = null
                    }
                    continue
                }

                const view = Executor.instance.rootView.viewLookup[end.value.location.viewId]

                const renderers =
                    view.renderer.animationRenderer.postEnvironmentRenderer.getAllChildRenderers()

                // Connection is between the first and second element
                const firstElement = currentElement
                const secondElement = renderers[end.value.id]?.element
                if (secondElement == null) {
                    console.warn('No element found for id', end.value.id, Object.keys(renderers))

                    if (end.children != null && end.children[0] != null) {
                        operation = end.children[0][0]
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
                        operation = end.children[0][0]
                        operationStack.push(operation)
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
                    operation = end.children[0][0]
                    end = end.children[0][1]
                } else {
                    end = null
                }

                this.operations[this.connections.length - 1] = []

                console.log('==========================')

                // Empty operations stack
                // const chunkedOperations = getDeepestChunks(
                //     Executor.instance.execution,
                //     new Set(operationStack.map((o) => o.executionId))
                // )

                // Empty operations stack
                while (operationStack.length > 0) {
                    const op = operationStack.pop()

                    if (hits.has(op.executionId)) {
                        continue
                    }

                    const executionNode = queryExecutionGraph(
                        this.parent.originalExecution,
                        (e) => e.id == op.executionId
                    )

                    this.operations[this.connections.length - 1].push(
                        new TraceOperator(executionNode)
                    )

                    hits.add(op.executionId)
                }
            }
        }
    }

    tick(dt: number) {
        if (this.globalTrace == null) return

        for (let i = this.connections.length - 1; i >= 0; i--) {
            const connection = this.connections[i]
            const { first, second } = this.connectionReferences[i]

            if (!document.body.contains(first) || !document.body.contains(second)) {
                connection.remove()
                this.connections.splice(i, 1)
                this.connectionReferences.splice(i, 1)

                for (let j = 0; j < this.operations[i].length; j++) {
                    this.operations[i][j].destroy()
                }
                delete this.operations[i]

                continue
            }

            const firstBbox = first.getBoundingClientRect()
            const secondBbox = second.getBoundingClientRect()

            const [sx, sy, c1x, c1y, c2x, c2y, ex, ey, ae] = getArrow(
                secondBbox.x + secondBbox.width / 2,
                secondBbox.y + secondBbox.height,
                firstBbox.x + firstBbox.width / 2,
                firstBbox.y,
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

        // Iterate operations
        for (const [key, ops] of Object.entries(this.operations)) {
            const connectionIndex = parseInt(key)
            const connection = this.connections[connectionIndex]

            for (let i = 0; i < ops.length; i++) {
                ops[i].tick(dt)
                const operationElement = ops[i].element
                const deviation = i - ops.length / 2 + 0.5

                const pt = connection.getPointAtLength(
                    connection.getTotalLength() -
                        80 * Executor.instance.PARAMS.b +
                        deviation * 20 * Executor.instance.PARAMS.a
                )

                operationElement.style.left = `${pt.x}px`
                operationElement.style.top = `${pt.y}px`

                operationElement.style.transform = `scale(${
                    (Math.sin(Math.PI * (i / ops.length)) * 0.2 + 0.8) *
                    Executor.instance.PARAMS.c *
                    4
                })`
            }
        }
    }

    hide() {
        for (const connection of this.connections) {
            connection.remove()
        }

        for (const [key, ops] of Object.entries(this.operations)) {
            for (const operationElement of ops) {
                operationElement.destroy()
            }
        }

        this.operations = {}

        this.connectionReferences = []
        this.connections = []

        this.globalTrace = null
    }
}
