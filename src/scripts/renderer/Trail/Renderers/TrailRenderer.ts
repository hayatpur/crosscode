import { EnvironmentState, Residual } from '../../../environment/EnvironmentState'
import { EnvironmentRenderer } from '../../View/Environment/EnvironmentRenderer'
import { Trail } from '../Trail'

export class TrailRenderer {
    trail: Trail

    /* ----------------------- Create ----------------------- */
    constructor(trail: Trail) {
        this.trail = trail
    }

    /* ----------------------- Animate ---------------------- */
    update(amount: number, environment: EnvironmentRenderer) {
        console.warn('Update not implemented for', this)
    }

    postUpdate(amount: number, environment: EnvironmentRenderer) {}

    computeResidual(environment: EnvironmentState): Residual | null {
        console.warn('Compute residual not implemented for', this)
        return null
    }

    /**
     * @param environment Current environment
     */
    applyTimestamps(environment: EnvironmentState) {
        console.warn('Apply timestamps not implemented for', this)
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        this.trail = null
    }
}
