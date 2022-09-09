import { ApplicationState } from '../../../ApplicationState'
import { getMemoryLocation, resolvePath } from '../../../environment/environment'
import { AccessorType, EnvironmentState, instanceOfEnvironment, Residual } from '../../../environment/EnvironmentState'
import { queryExecutionGraph } from '../../../execution/execution'
import { ExecutionGraph } from '../../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../../execution/primitive/ExecutionNode'
import { createElement, getPerfectArrow } from '../../../utilities/dom'
import { assert } from '../../../utilities/generic'
import { getTitleFromExecution } from '../../Action/Dynamic/Representation'
import { EnvironmentRenderer } from '../../View/Environment/EnvironmentRenderer'
import { Trail } from '../Trail'
import { resetResidual, TrailRenderer, updateResidual } from './TrailRenderer'

export class MoveTrailRenderer extends TrailRenderer {
    trace: SVGPathElement
    arrowHead: SVGPolygonElement

    tempElement: HTMLElement | null = null

    // Trace indicator
    operationExecution: ExecutionGraph | ExecutionNode | null = null
    operationIndicator: { trace: HTMLElement; source: HTMLElement } | null = null

    /* ----------------------- Create ----------------------- */
    constructor(trail: Trail) {
        super(trail)

        // Create movement trace
        this.trace = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        this.trace.classList.add('action-mapping-connection', 'trail-move')

        // Create arrow head
        this.arrowHead = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
        this.arrowHead.classList.add('action-mapping-arrow-head', 'trail-move-arrow-head')
        this.arrowHead.setAttribute('points', '0,-6 12,0, 0,6')

        const visualization = ApplicationState.visualization
        visualization.view!.svg.appendChild(this.trace)

        // OKAY I"M WORKING ON THIS, IT WILL GET DONE!
        const operation = this.trail.state.operations[0]
        if (operation == null) return

        this.operationIndicator = {
            trace: createElement('div', 'operation-indicator', document.body),
            source: createElement('div', 'operation-indicator-source', document.body),
        }

        this.operationIndicator.trace.classList.add('is-hidden')
        this.operationIndicator.source.classList.add('is-hidden')

        this.operationIndicator.trace.addEventListener('mouseover', () => {
            this.operationIndicator?.source.classList.add('is-hover')
        })

        this.operationIndicator.trace.addEventListener('mouseout', () => {
            this.operationIndicator?.source.classList.remove('is-hover')
        })

        // // Find execution node of that operation
        const programExecution = ApplicationState.actions[visualization.programId!].execution
        this.operationExecution = queryExecutionGraph(programExecution, (node) => node.id == operation.executionID)

        // Set title
        this.operationIndicator.trace.setAttribute('title', getTitleFromExecution(this.operationExecution))

        ApplicationState.traceIndicators.push(this.operationIndicator)
    }

    /* ---------------------- Animation --------------------- */
    update(amount: number, environment: EnvironmentRenderer, totalTime: number) {
        /* ---------------------- Old data ---------------------- */
        const prev = environment.getResidualOf(this.trail.state.toDataID, this.trail.time)

        let shouldHideIndicator = false

        if (prev != null) {
            updateResidual(amount, prev)
        } else {
            // Reset the residual
            const prev = environment.findRendererById(this.trail.state.toDataID)
            if (prev != null) {
                resetResidual(prev.data)
            }
        }

        /* ---------------------- New data ---------------------- */
        assert(this.trail.state.fromDataIDs != undefined, 'fromDataIDs is undefined.')

        // Update path
        const start = environment.getResidualOf(this.trail.state.fromDataIDs[0], this.trail.time)
        const end = environment.getResidualOf(this.trail.state.toDataID, this.trail.time + 1)

        if (end == null || start == null) {
            this.trace.classList.add('hidden')
            this.arrowHead.classList.add('hidden')
            shouldHideIndicator = true
            return
        } else {
            this.trace.classList.remove('hidden')
            this.arrowHead.classList.remove('hidden')
        }

        if (this.tempElement == null) {
            this.tempElement = end.element.cloneNode(true) as HTMLElement
            this.tempElement.classList.add('temp-move')
            document.body.appendChild(this.tempElement)
        }

        if (!start.element.isConnected || !end.element.isConnected) {
            this.trace.classList.add('hidden')
            shouldHideIndicator = true
            return
        } else {
            this.trace.classList.remove('hidden')
        }

        const visualization = ApplicationState.visualization
        const viewBbox = visualization.view!.element.getBoundingClientRect()
        const startBbox = start.element.getBoundingClientRect()
        const endBbox = end.element.getBoundingClientRect()

        const [d, ex, ey, endAngleAsDegrees] = getPerfectArrow(
            startBbox.x + startBbox.width / 2 - viewBbox.x,
            startBbox.y + startBbox.height / 2 - viewBbox.y,
            endBbox.x + endBbox.width / 2 - viewBbox.x,
            endBbox.y + endBbox.height / 2 - viewBbox.y
        )

        this.arrowHead.setAttribute('transform', `translate(${ex}, ${ey}) rotate(${endAngleAsDegrees}) scale(0.5)`)
        this.trace.setAttribute('d', d)

        this.trace.style.strokeDasharray = `${this.trace.getTotalLength()}`
        this.trace.style.strokeDashoffset = `${this.trace.getTotalLength() - amount * this.trace.getTotalLength()}`
        let { x, y } = this.trace.getPointAtLength(amount * this.trace.getTotalLength())

        if (this.trace.style.transition == '') {
            this.trace.style.transition = '0.2s'
        }

        const traceContainerBbox = this.trace.parentElement!.getBoundingClientRect()

        // Update position of operation indicator
        if (this.operationIndicator != null) {
            if (this.operationExecution != null) {
                // Trace position
                const { x: x2, y: y2 } = this.trace.getPointAtLength((amount * this.trace.getTotalLength()) / 2)

                this.operationIndicator.trace.style.left = `${x2 + traceContainerBbox.x - 2.5}px`
                this.operationIndicator.trace.style.top = `${y2 + traceContainerBbox.y - 2.5}px`

                // Source position
                let sourceBbox = ApplicationState.editor.computeBoundingBoxForLoc(
                    this.operationExecution.nodeData.location!
                )
                this.operationIndicator.source.style.left = `${sourceBbox.x}px`
                this.operationIndicator.source.style.top = `${sourceBbox.y}px`
                this.operationIndicator.source.style.width = `${sourceBbox.width}px`
                this.operationIndicator.source.style.height = `${sourceBbox.height}px`
            } else {
                shouldHideIndicator = true
            }
        }

        if (environment.element.parentElement?.parentElement == null) {
            throw new Error('Parent element is null')
        }

        // Update transform
        x -= endBbox.width / 2
        y -= endBbox.height / 2

        // Update temp position
        this.tempElement.style.left = `${x + traceContainerBbox.x}px`
        this.tempElement.style.top = `${y + traceContainerBbox.y}px`

        const fadeout = Math.exp(-0.1 * Math.abs(totalTime - this.trail.time) ** 6)
        this.trace.style.opacity = `${Math.max(0.4, fadeout)}`
        this.trace.style.strokeWidth = `${Math.max(0.4, fadeout) * 3}`

        if (fadeout < 0.4) {
            this.trace.classList.add('is-expired')
            shouldHideIndicator = true
        } else {
            this.trace.classList.remove('is-expired')
        }

        if (amount == 0) {
            shouldHideIndicator = true
        }

        if (shouldHideIndicator) {
            this.operationIndicator?.trace.classList.add('is-hidden')
            this.operationIndicator?.source.classList.add('is-hidden')
        } else {
            this.operationIndicator?.trace.classList.remove('is-hidden')
            this.operationIndicator?.source.classList.remove('is-hidden')
        }

        if (amount != 1) {
            end.element.style.opacity = `${0}`
        }

        this.tempElement.style.opacity = `${1}`
    }

    postUpdate(amount: number, environment: EnvironmentRenderer, totalTime: number) {
        if (amount == 1 || amount == 0) {
            if (this.tempElement != null) {
                this.tempElement.remove()
                this.tempElement = null
            }
        }

        if (amount == 1) {
            assert(this.trail.state.fromDataIDs != undefined, 'fromDataIDs is undefined.')

            const start = environment.getResidualOf(this.trail.state.fromDataIDs[0], this.trail.time)
            const end = environment.getResidualOf(this.trail.state.toDataID, this.trail.time + 1)

            if (end == null || start == null) {
                return
            }

            end.element.style.opacity = `${1}`
        }

        // Update path
        if (amount == 0) {
            this.trace.classList.add('hidden')
        }
    }

    alwaysUpdate(environment: EnvironmentRenderer) {}

    computeResidual(environment: EnvironmentState): Residual | null {
        const prev = resolvePath(environment, [{ type: AccessorType.ID, value: this.trail.state.toDataID }], null)

        if (instanceOfEnvironment(prev)) {
            return null
        }

        const location = getMemoryLocation(environment, prev).foundLocation

        if (location == null) {
            throw new Error('Location is null')
        }

        return {
            data: prev,
            location: location,
        }
    }

    applyTimestamps(environment: EnvironmentState) {
        environment.timestamps[this.trail.state.toDataID] = this.trail.time
    }

    /* ---------------------- Destroy --------------------- */
    destroy() {
        super.destroy()

        this.trace.remove()
        this.arrowHead.remove()

        this.tempElement?.remove()

        if (this.operationIndicator != null) {
            ApplicationState.traceIndicators.splice(
                ApplicationState.traceIndicators.indexOf(this.operationIndicator),
                1
            )
            this.operationIndicator?.source.remove()
            this.operationIndicator?.trace.remove()
        }
    }
}
