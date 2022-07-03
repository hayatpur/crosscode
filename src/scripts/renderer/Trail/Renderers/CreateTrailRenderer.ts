import { getMemoryLocation, resolvePath } from '../../../environment/environment'
import { AccessorType, EnvironmentState, instanceOfEnvironment, Residual } from '../../../environment/EnvironmentState'
import { remap } from '../../../utilities/math'
import { DataRenderer } from '../../View/Environment/data/DataRenderer'
import { EnvironmentRenderer } from '../../View/Environment/EnvironmentRenderer'
import { Trail } from '../Trail'
import { TrailRenderer, updateResidual } from './TrailRenderer'

export class CreateTrailRenderer extends TrailRenderer {
    /* ----------------------- Create ----------------------- */
    constructor(trail: Trail) {
        super(trail)
    }

    /* ----------------------- Animate ---------------------- */
    update(amount: number, environment: EnvironmentRenderer) {
        /* ---------------------- Old data ---------------------- */
        const prev = environment.getResidualOf(this.trail.state.toDataId, this.trail.time)
        if (prev != null) {
            updateResidual(amount, prev)
        }

        /* ---------------------- New data ---------------------- */
        const t = remap(amount, 0, 1, 5, 0)
        const data = environment.getResidualOf(this.trail.state.toDataId, this.trail.time + 1) as DataRenderer

        if (amount == 1 && data == null) {
            // Has been destroyed
            return
        }

        data.element.style.transform = `translate(${t}px, ${-t}px)`
        data.element.style.opacity = `${Math.min(1, amount * 2)}`
        data.element.style.left = '0px'
        data.element.style.top = '0px'
    }

    /**
     * @param environment Prev environment
     * @returns
     */
    computeResidual(environment: EnvironmentState): Residual | null {
        const prev = resolvePath(environment, [{ type: AccessorType.ID, value: this.trail.state.toDataId }], null)

        if (instanceOfEnvironment(prev)) {
            return null
        }

        return {
            data: prev,
            location: getMemoryLocation(environment, prev).foundLocation,
        }
    }

    applyTimestamps(environment: EnvironmentState) {
        environment.timestamps[this.trail.state.toDataId] = this.trail.time
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        super.destroy()
    }
}
