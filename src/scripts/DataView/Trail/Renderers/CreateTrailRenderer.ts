import { getMemoryLocation, resolvePath } from '../../../transpiler/environment'
import { AccessorType, EnvironmentState, instanceOfEnvironment, Residual } from '../../../transpiler/EnvironmentState'
import { remap } from '../../../utilities/math'
import { DataRenderer } from '../../View/Environment/data/DataRenderer'
import { EnvironmentRenderer } from '../../View/Environment/EnvironmentRenderer'
import { Trail } from '../Trail'
import { resetResidual, TrailRenderer, updateResidual } from './TrailRenderer'

export class CreateTrailRenderer extends TrailRenderer {
    /* ----------------------- Create ----------------------- */
    constructor(trail: Trail) {
        super(trail)
    }

    /* ----------------------- Animate ---------------------- */
    update(amount: number, environment: EnvironmentRenderer, totalTime: number) {
        /* ---------------------- Old data ---------------------- */
        const prev = environment.getResidualOf(this.trail.state.toDataID, this.trail.time)
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
        const t = remap(amount, 0, 1, 5, 0)
        const data = environment.getResidualOf(this.trail.state.toDataID, this.trail.time + 1) as DataRenderer

        if ((amount == 1 && data == null) || (amount == 0 && data == null)) {
            // Has been destroyed / not yet initialized
            return
        } else if (data == null) {
            console.warn('Data is null in CreateTrailRenderer')
            return
        }

        // data.element.style.transform = `translate(${t}px, ${-t}px)`
        data.element.style.opacity = `${Math.min(1, amount * 2)}`
        data.element.style.left = '0px'
        data.element.style.top = '0px'
    }

    /**
     * @param environment Prev environment
     * @returns
     */
    computeResidual(environment: EnvironmentState): Residual | null {
        const prev = resolvePath(environment, [{ type: AccessorType.ID, value: this.trail.state.toDataID }], null)

        if (instanceOfEnvironment(prev)) {
            return null
        }

        const location = getMemoryLocation(environment, prev).foundLocation

        if (location == null) {
            throw new Error('Location not found')
        }

        return {
            data: prev,
            location: location,
        }
    }

    applyTimestamps(environment: EnvironmentState) {
        environment.timestamps[this.trail.state.toDataID] = this.trail.time
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        super.destroy()
    }
}
