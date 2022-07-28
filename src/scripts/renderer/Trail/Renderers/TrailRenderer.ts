import {
    EnvironmentState,
    Residual,
} from '../../../environment/EnvironmentState'
import { remap } from '../../../utilities/math'
import { DataRenderer } from '../../View/Environment/data/DataRenderer'
import { EnvironmentRenderer } from '../../View/Environment/EnvironmentRenderer'
import { IdentifierRenderer } from '../../View/Environment/identifier/IdentifierRenderer'
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

    alwaysUpdate(environment: EnvironmentRenderer) {}

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
    destroy() {}
}

export function updateResidual(
    amount: number,
    prev: DataRenderer | IdentifierRenderer
) {
    const pt = remap(amount, 0, 1, 0, 5)
    let offset = 0
    let hit = false

    if (prev.element.parentElement == null) {
        throw new Error('Element has no parent')
    }

    for (let i = 0; i < prev.element.parentElement.childElementCount; i++) {
        const child = prev.element.parentElement.children[i]
        if (hit) {
            offset++
        }

        if (child == prev.element) {
            hit = true
        }
    }
    offset *= 5

    prev.element.style.transform = `translate(${-pt - offset}px, ${
        pt + offset
    }px) scale(${1})`

    if (offset / 5 >= 2) {
        prev.element.style.opacity = `${0}`
    } else if (offset / 5 >= 1) {
        prev.element.style.opacity = `${Math.max(
            0,
            1 - 0.8 * amount - offset / 20
        )}`
    } else {
        prev.element.style.opacity = `${Math.max(0.1, 1 - 0.8 * amount)}`
    }

    prev.element.style.filter = `saturate(${Math.max(0, 1 - 2 * amount)})`
}
