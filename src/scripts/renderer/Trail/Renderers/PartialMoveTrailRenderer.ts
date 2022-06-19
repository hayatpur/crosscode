import { EnvironmentState, Residual } from '../../../environment/EnvironmentState'
import { Executor } from '../../../executor/Executor'
import { getPerfectArrow, reflow } from '../../../utilities/dom'
import { getNumericalValueOfStyle } from '../../../utilities/math'
import { EnvironmentRenderer } from '../../View/Environment/EnvironmentRenderer'
import { Trail } from '../Trail'
import { TrailRenderer } from './TrailRenderer'

export class PartialMoveTrailRenderer extends TrailRenderer {
    trace: SVGPathElement

    /* ----------------------- Create ----------------------- */
    constructor(trail: Trail) {
        super(trail)

        // Create movement trace
        this.trace = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        this.trace.classList.add('action-mapping-connection', 'trail-move')
        Executor.instance.visualization.view.renderer.svg.appendChild(this.trace)
    }

    /* ----------------------- Animate ---------------------- */
    update(amount: number, environment: EnvironmentRenderer) {
        const start = environment.getResidualOf(this.trail.state.fromDataIds[0], this.trail.time)
        const end = environment.getResidualOf(this.trail.state.toDataId, this.trail.time + 1)

        if (end == null || start == null) {
            this.trace.classList.add('hidden')
            return
        } else {
            this.trace.classList.remove('hidden')
        }

        end.element.style.transform = ''
        reflow(end.element)

        const viewBbox =
            Executor.instance.visualization.view.renderer.element.getBoundingClientRect()
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
        let { x, y } = this.trace.getPointAtLength(amount * this.trace.getTotalLength())

        // Update transform
        const environmentBbox = environment.element.getBoundingClientRect()
        x -= endBbox.x + endBbox.width / 2 - environmentBbox.x
        y -= endBbox.y + endBbox.height / 2 - environmentBbox.y
        end.element.style.transform = `translate(${x}px, ${y}px)`
    }

    postUpdate(amount: number, environment: EnvironmentRenderer) {
        if (amount == 1) {
            const start = environment.getResidualOf(
                this.trail.state.fromDataIds[0],
                this.trail.time
            )
            const end = environment.getResidualOf(this.trail.state.toDataId, this.trail.time + 1)

            if (end == null || start == null) {
                this.trace.classList.add('hidden')
                return
            } else {
                this.trace.classList.remove('hidden')
            }

            const viewBbox =
                Executor.instance.visualization.view.renderer.element.getBoundingClientRect()
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

            this.trace.style.opacity = `${Math.min(
                getNumericalValueOfStyle(end.element.style.opacity, 1),
                getNumericalValueOfStyle(start.element.style.opacity, 1)
            )}`
        }

        // Update path
        if (amount == 0) {
            this.trace.classList.add('hidden')
        }
    }

    /**
     * @param environment Prev environment
     * @returns
     */
    computeResidual(environment: EnvironmentState): Residual | null {
        return null
    }

    applyTimestamps(environment: EnvironmentState) {}

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        super.destroy()

        this.trace.remove()
        this.trace = null
    }
}
