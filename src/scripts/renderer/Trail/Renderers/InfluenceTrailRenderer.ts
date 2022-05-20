import { Trail } from '../Trail'
import { TrailRenderer } from './TrailRenderer'

export class InfluenceTrailRenderer extends TrailRenderer {
    movementTrace: SVGPathElement

    /* ----------------------- Create ----------------------- */
    constructor(trail: Trail) {
        super(trail)
    }

    /* ----------------------- Animate ---------------------- */
    update() {
        console.warn('Update not implemented for', this)
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        console.warn('Destroy not implemented for', this)
    }
}
