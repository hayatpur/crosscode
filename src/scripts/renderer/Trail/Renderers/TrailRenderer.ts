import { Trail } from '../Trail'

export class TrailRenderer {
    trail: Trail

    /* ----------------------- Create ----------------------- */
    constructor(trail: Trail) {
        this.trail = trail
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
