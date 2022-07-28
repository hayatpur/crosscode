import { ApplicationState } from '../../../ApplicationState'
import {
    getMemoryLocation,
    resolvePath,
} from '../../../environment/environment'
import {
    AccessorType,
    EnvironmentState,
    instanceOfEnvironment,
    Residual,
} from '../../../environment/EnvironmentState'
import { getPerfectArrow, reflow } from '../../../utilities/dom'
import { getNumericalValueOfStyle } from '../../../utilities/math'
import { EnvironmentRenderer } from '../../View/Environment/EnvironmentRenderer'
import { Trail } from '../Trail'
import { TrailRenderer, updateResidual } from './TrailRenderer'

export class MoveTrailRenderer extends TrailRenderer {
    trace: SVGPathElement

    /* ----------------------- Create ----------------------- */
    constructor(trail: Trail) {
        super(trail)

        if (ApplicationState.visualization?.view == null) {
            throw new Error('View is not initialized')
        }

        // Create movement trace
        this.trace = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
        )
        this.trace.classList.add('action-mapping-connection', 'trail-move')
        ApplicationState.visualization.view.svg.appendChild(this.trace)
    }

    /* ---------------------- Animation --------------------- */
    update(amount: number, environment: EnvironmentRenderer) {
        /* ---------------------- Old data ---------------------- */
        const prev = environment.getResidualOf(
            this.trail.state.toDataID,
            this.trail.time
        )

        if (prev != null) {
            updateResidual(amount, prev)
        }

        /* ---------------------- New data ---------------------- */
        if (this.trail.state.fromDataIDs == undefined) {
            throw new Error('fromDataIDs is undefined.')
        }

        // Update path
        const start = environment.getResidualOf(
            this.trail.state.fromDataIDs[0],
            this.trail.time
        )
        const end = environment.getResidualOf(
            this.trail.state.toDataID,
            this.trail.time + 1
        )

        if (end == null || start == null) {
            this.trace.classList.add('hidden')
            return
        } else {
            this.trace.classList.remove('hidden')
        }

        end.element.style.transform = ''
        reflow(end.element)

        if (ApplicationState.visualization?.view == null) {
            throw new Error('View is not initialized')
        }

        const viewBbox =
            ApplicationState.visualization.view.element.getBoundingClientRect()
        const startBbox = start.element.getBoundingClientRect()
        const endBbox = end.element.getBoundingClientRect()

        this.trace.setAttribute(
            'd',
            getPerfectArrow(
                startBbox.x + startBbox.width / 2 - viewBbox.x,
                startBbox.y + startBbox.height / 2 - viewBbox.y,
                endBbox.x + endBbox.width / 2 - viewBbox.x,
                endBbox.y + endBbox.height / 2 - viewBbox.y
            )
        )

        this.trace.style.strokeDasharray = `${this.trace.getTotalLength()}`
        this.trace.style.strokeDashoffset = `${
            this.trace.getTotalLength() - amount * this.trace.getTotalLength()
        }`
        let { x, y } = this.trace.getPointAtLength(
            amount * this.trace.getTotalLength()
        )

        if (environment.element.parentElement?.parentElement == null) {
            throw new Error('Parent element is null')
        }

        // Update transform
        const environmentBbox =
            environment.element.parentElement.parentElement.getBoundingClientRect()
        x -= endBbox.x + endBbox.width / 2 - environmentBbox.x
        y -= endBbox.y + endBbox.height / 2 - environmentBbox.y
        end.element.style.transform = `translate(${x}px, ${y}px)`
    }

    postUpdate(amount: number, environment: EnvironmentRenderer) {
        if (amount == 1) {
            if (this.trail.state.fromDataIDs == undefined) {
                throw new Error('fromDataIDs is undefined.')
            }

            const start = environment.getResidualOf(
                this.trail.state.fromDataIDs[0],
                this.trail.time
            )
            const end = environment.getResidualOf(
                this.trail.state.toDataID,
                this.trail.time + 1
            )

            if (end == null || start == null) {
                return
            }

            if (ApplicationState.visualization?.view == null) {
                throw new Error('View is not initialized')
            }

            const viewBbox =
                ApplicationState.visualization.view.element.getBoundingClientRect()
            const startBbox = start.element.getBoundingClientRect()
            const endBbox = end.element.getBoundingClientRect()

            this.trace.setAttribute(
                'd',
                getPerfectArrow(
                    startBbox.x + startBbox.width / 2 - viewBbox.x,
                    startBbox.y + startBbox.height / 2 - viewBbox.y,
                    endBbox.x + endBbox.width / 2 - viewBbox.x,
                    endBbox.y + endBbox.height / 2 - viewBbox.y
                )
            )

            this.trace.style.strokeDasharray = `${this.trace.getTotalLength()}`
            this.trace.style.strokeDashoffset = `${
                this.trace.getTotalLength() - 1 * this.trace.getTotalLength()
            }`

            this.trace.style.opacity = `${Math.max(
                getNumericalValueOfStyle(end.element.style.opacity, 1),
                getNumericalValueOfStyle(start.element.style.opacity, 1)
            )}`
        }

        // Update path
        if (amount == 0) {
            this.trace.classList.add('hidden')
        }
    }

    alwaysUpdate(environment: EnvironmentRenderer) {}

    computeResidual(environment: EnvironmentState): Residual | null {
        const prev = resolvePath(
            environment,
            [{ type: AccessorType.ID, value: this.trail.state.toDataID }],
            null
        )

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
    }
}
