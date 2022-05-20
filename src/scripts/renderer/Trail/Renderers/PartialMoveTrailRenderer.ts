import { getCurvedArrow } from '../../../utilities/dom'
import { Trail } from '../Trail'
import { TrailRenderer } from './TrailRenderer'

export class PartialMoveTrailRenderer extends TrailRenderer {
    movementTrace: SVGPathElement

    /* ----------------------- Create ----------------------- */
    constructor(trail: Trail) {
        super(trail)

        // Create movement trace
        this.movementTrace = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        this.movementTrace.classList.add('action-mapping-connection', 'trail-move')
        trail.endEnvironment.svg.appendChild(this.movementTrace)
    }

    /* ----------------------- Animate ---------------------- */
    update() {
        // Update path
        if (this.trail.time == 0) {
            this.movementTrace.classList.add('hidden')
        } else {
            this.movementTrace.classList.remove('hidden')
        }

        const start =
            this.trail.startEnvironment.getAllChildRenderers()[this.trail.state.fromDataIds[0]]
                .element
        const end =
            this.trail.endEnvironment.getAllChildRenderers()[this.trail.state.toDataId].element

        const environmentBbox = this.trail.endEnvironment.element.getBoundingClientRect()
        const startBbox = start.getBoundingClientRect()
        const endBbox = end.getBoundingClientRect()

        this.movementTrace.setAttribute(
            'd',
            getCurvedArrow(
                startBbox.x + startBbox.width / 2 - environmentBbox.x,
                startBbox.y + startBbox.height / 2 - environmentBbox.y,
                endBbox.x + endBbox.width / 2 - environmentBbox.x,
                endBbox.y + endBbox.height / 2 - environmentBbox.y
            )
        )

        this.movementTrace.style.strokeDasharray = `${this.movementTrace.getTotalLength()}`
        this.movementTrace.style.strokeDashoffset = `${
            this.movementTrace.getTotalLength() -
            this.trail.time * this.movementTrace.getTotalLength()
        }`

        let { x, y } = this.movementTrace.getPointAtLength(
            this.trail.time * this.movementTrace.getTotalLength()
        )
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        this.movementTrace.remove()
    }
}
